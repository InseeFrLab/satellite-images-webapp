import os

import geopandas as gpd
import numpy as np
import pandas as pd
import s3fs
from pyproj import CRS


def compute_evolution(data: pd.DataFrame, year_start: str, year_end: str) -> pd.DataFrame:
    """
    Compute the absolute and relative evolution of values between two years.

    Parameters:
    -----------
    data : pd.DataFrame
        A pandas DataFrame containing at least the columns: "code", "depcom_2018",
        and the specified `year_start` and `year_end`.

    year_start : str
        The column name representing the starting year of the calculation.

    year_end : str
        The column name representing the ending year of the calculation.

    Returns:
    --------
    pd.DataFrame
        A DataFrame containing the computed absolute and relative evolution values,
        along with the original "code" and "depcom_2018" columns.

    Notes:
    ------
    - `evol_abs` represents the absolute change multiplied by 1e6.
    - `evol_rela` represents the relative change as a percentage.
    - Assumes `year_start` and `year_end` exist as numerical columns in `data`.
    - If `year_start` has zeros, the relative evolution (`evol_rela`) will result in `inf` or `NaN`.

    Example:
    --------
    ```python
    data = pd.DataFrame({
        "code": ["A", "B", "C"],
        "depcom_2018": [101, 102, 103],
        "2018": [100, 200, 300],
        "2020": [150, 250, 350]
    })

    df_result = compute_evolution(data, "2018", "2020")
    print(df_result)
    ```
    """
    df = pd.DataFrame()
    df["code"] = data["code"]
    df["depcom_2018"] = data["depcom_2018"]
    df["evol_abs"] = (data[year_end] - data[year_start]) * 1e6
    df["evol_rela"] = ((data[year_end] - data[year_start]) / data[year_start]) * 100
    df["year_start"] = year_start
    df["year_end"] = year_end
    df.replace([np.inf, -np.inf], np.nan, inplace=True)

    return df


def merge_gdfs(gdfs, id_columns, value_columns):
    """Merge multiple GeoDataFrames on specified columns."""
    base_gdf = None
    for year, gdf in gdfs.items():
        year_columns = [*id_columns, *[f"{col}_{year}" for col in value_columns]]
        current_gdf = gdf[year_columns]

        if base_gdf is None:
            base_gdf = current_gdf
        else:
            base_gdf = base_gdf.merge(current_gdf, on=id_columns)

    return base_gdf


def creer_donnees_comparaison(file_paths):
    id_columns = ["ident_ilot", "code", "depcom_2018", "ident_up", "dep", "geometry"]
    value_columns = ["area_cluster", "area_building", "pct_building"]

    # Set up S3 filesystem
    fs = s3fs.S3FileSystem(
        client_kwargs={"endpoint_url": f"https://{os.environ['AWS_S3_ENDPOINT']}"},
        key=os.getenv("AWS_ACCESS_KEY_ID"),
        secret=os.getenv("AWS_SECRET_ACCESS_KEY"),
        # token=os.environ["AWS_SESSION_TOKEN"],
    )

    gdfs = {year: gpd.read_parquet(path, filesystem=fs) for year, path in file_paths.items()}

    # Rename columns in each GeoDataFrame
    gdfs = {
        year: gdf.rename(columns={col: f"{col}_{year}" for col in value_columns})
        for year, gdf in gdfs.items()
    }

    # Merge all GeoDataFrames
    merged_gdf = merge_gdfs(gdfs, id_columns, value_columns)

    merged_gdf.loc[:, "building_2023"] = merged_gdf.loc[:, "area_building_2023"] * 1e6

    merged_gdf.loc[:, "area_building_change_absolute"] = (
        merged_gdf.loc[:, "area_building_2023"] - merged_gdf.loc[:, "area_building_2022"]
    ) * 1e6

    merged_gdf.loc[:, "area_building_change_relative"] = (
        merged_gdf.loc[:, "area_building_change_absolute"]
        / (merged_gdf.loc[:, "area_building_2022"] * 1e6)
    ) * 100

    # Order columns
    ordered_columns = (
        id_columns[:-1]  # All ID columns except geometry
        + [
            "pct_building_2023",
            "building_2023",
            "area_building_change_absolute",
            "area_building_change_relative",
        ]  # Value columns
        + ["geometry"]  # Put geometry at the end
    )

    # Remplacer les NaN et Infinity par 0
    final_gdf_cleaned = merged_gdf.replace([np.nan, np.inf, -np.inf], 0)

    return final_gdf_cleaned[ordered_columns].set_index("ident_ilot").to_crs("EPSG:4326")


# Fonction pour reprojeter selon le CRS déclaré
def reproject_geometry(geometry, crs_string, crs_target):
    try:
        # Essayer de lire le CRS
        src_crs = CRS.from_user_input(crs_string)
        tgt_crs = CRS.from_epsg(crs_target)
        return gpd.GeoSeries([geometry], crs=src_crs).to_crs(tgt_crs).iloc[0]
    except Exception as e:
        print(f"⚠️ Problème avec le CRS {crs_string}: {e}")
        return None
