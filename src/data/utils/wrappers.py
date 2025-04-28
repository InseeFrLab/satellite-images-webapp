import os
from itertools import combinations
from typing import List

import geopandas as gpd
import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq
import s3fs
from geopandas import overlay
from shapely.geometry import box

from .fonctions import compute_evolution


def connect_s3():
    fs = s3fs.S3FileSystem(
        client_kwargs={"endpoint_url": f"https://{os.environ['AWS_S3_ENDPOINT']}"},
        key=os.getenv("AWS_ACCESS_KEY_ID"),
        secret=os.getenv("AWS_SECRET_ACCESS_KEY"),
        # token=os.environ["AWS_SESSION_TOKEN"]
    )
    return fs


def get_data_level(
    available_years: List[int], dep: str, model_name: str, model_version: str
) -> pd.DataFrame:
    """
    Loads prediction data from an S3 bucket for multiple years and processes it.

    Parameters:
    -----------
    available_years : List[int]
        A list of years for which the data is available.

    dep : str
        The department identifier (used in the S3 file path).

    model_name : str
        The name of the prediction model.

    model_version : str
        The version of the prediction model.

    Returns:
    --------
    pd.DataFrame
        A DataFrame containing the prediction statistics, including "code", "depcom_2018",
        "area_building", "pct_building", and "year".

    Notes:
    ------
    - The function connects to an S3-compatible storage using credentials from environment variables.
    - Reads Parquet files for each year and appends them to a list before concatenation.
    - "area_building" values are multiplied by `1e6` for unit conversion.
    - The resulting DataFrame includes data for multiple years.

    Example:
    --------
    ```python
    available_years = [2018, 2020, 2022]
    dep = "75"
    model_name = "slum-detection"
    model_version = "v1"

    df_result = load_prediction_data_from_s3(available_years, dep, model_name, model_version)
    print(df_result.head())
    ```
    """
    # Initialize S3 filesystem connection
    fs = connect_s3()

    # List to store DataFrames for each year
    list_df = []

    # Load data for each available year
    for year in available_years:
        path = f"projet-slums-detection/data-prediction/PLEIADES/{dep}/{year}/{model_name}/{model_version}/statistics_clusters.parquet"

        # Read Parquet file from S3
        df = pd.read_parquet(path, filesystem=fs)

        # Select relevant columns
        df = df.loc[:, ["code", "depcom_2018", "area_building", "pct_building"]]

        # Add year information
        df["year"] = year

        # Append to list
        list_df.append(df)

    # Concatenate all years' data into a single DataFrame
    data = pd.concat(list_df, ignore_index=True)

    # Convert "area_building" values to the appropriate scale
    data["area_building"] *= 1e6

    return data


def get_data_evol(
    dep: str, available_years: List[int], model_name: str, model_version: str
) -> pd.DataFrame:
    """
    Loads building area data from S3, processes it, and computes evolution statistics
    for all unique year pairs.

    Parameters:
    -----------
    dep : str
        The department identifier (used in the S3 file path).

    available_years : List[int]
        A list of years for which the data is available.

    model_name : str
        The name of the model used for prediction.

    model_version : str
        The version of the model used.

    Returns:
    --------
    pd.DataFrame
        A DataFrame containing the computed absolute and relative evolution values
        for all unique year pairs.

    Notes:
    ------
    - The function retrieves data stored in an S3 bucket using `s3fs`.
    - It processes data for multiple years and pivots it to facilitate year-to-year comparisons.
    - Evolution statistics are computed using `compute_evolution()`, applied to all unique year pairs.

    Example:
    --------
    ```python
    available_years = [2018, 2020, 2022]
    dep = "75"
    model_name = "slum-detection"
    model_version = "v1"

    df_result = load_and_compute_evolution(dep, available_years, model_name, model_version)
    print(df_result)
    ```
    """
    # Generate all unique year pairs for comparison
    year_pairs = list(combinations(available_years, 2))

    # Initialize S3 filesystem connection
    fs = connect_s3()

    # Load data from S3 for each available year
    list_df = []
    for year in available_years:
        path = f"projet-slums-detection/data-prediction/PLEIADES/{dep}/{year}/{model_name}/{model_version}/statistics_clusters.parquet"

        df = pd.read_parquet(path, filesystem=fs)
        df = df.loc[:, ["code", "depcom_2018", "area_building"]]
        df["year"] = year
        list_df.append(df)

    # Combine all years' data into a single DataFrame
    data = pd.concat(list_df)

    # Pivot the table to have years as columns for easier comparison
    data = data.pivot(
        index=["code", "depcom_2018"], columns="year", values="area_building"
    ).reset_index()

    # Compute evolution for all unique year pairs
    evolution_df = pd.concat(
        [compute_evolution(data, year_start, year_end) for year_start, year_end in year_pairs]
    )

    return evolution_df


def get_build_evol(
    dep: str, available_years: List[int], model_name: str, model_version: str, evolution: str
) -> pd.DataFrame:
    # Initialize S3 filesystem connection
    fs = connect_s3()

    if len(available_years) > 1:
        # Load data from S3 for each available year
        data_list = []

        for year in available_years[1:]:
            path = f"projet-slums-detection/data-prediction/PLEIADES/{dep}/{year}/{model_name}/{model_version}/{evolution}.parquet"
            df = gpd.read_parquet(path, filesystem=fs)
            data_list.append(df)

        data = pd.concat(data_list, ignore_index=True)
    else:
        year = available_years[0]
        path = f"projet-slums-detection/data-prediction/PLEIADES/{dep}/{year}/{model_name}/{model_version}/predictions.parquet"
        df = gpd.read_parquet(path, filesystem=fs)
        df = df[df['label'] == 1][['geometry']].copy()
        df["year_start"] = year
        df["year_end"] = year
        data = df[['geometry', 'year_start', 'year_end']]

    return data


def get_cluster_geom(dep: str) -> gpd.GeoDataFrame:
    """
    Loads cluster data from an S3 bucket, filtering by department and converting it into a GeoDataFrame.

    Parameters:
    -----------
    dep : str
        The department code used to filter the dataset.

    Returns:
    --------
    gpd.GeoDataFrame
        A GeoDataFrame containing cluster information, including "code", "depcom_2018", and "geometry".

    Notes:
    ------
    - The function connects to an S3-compatible storage using credentials from environment variables.
    - Reads a Parquet dataset, filtering it by the specified department (`dep`).
    - Converts the "geometry" column from WKT format to a proper GeoSeries.
    - The returned GeoDataFrame is set to the EPSG:4326 coordinate reference system.

    Example:
    --------
    ```python
    dep = "75"  # Example department code
    clusters_gdf = load_clusters_from_s3(dep)
    print(clusters_gdf.head())
    ```
    """
    # Initialize S3 filesystem connection
    fs = connect_s3()

    # Load and filter Parquet dataset
    clusters = (
        pq.ParquetDataset(
            "projet-slums-detection/data-clusters", filesystem=fs, filters=[("dep", "=", dep)]
        )
        .read()
        .to_pandas()
    )

    # Convert "geometry" column from WKT to a GeoSeries
    clusters["geometry"] = gpd.GeoSeries.from_wkt(clusters["geometry"])

    # Select relevant columns and create a GeoDataFrame
    clusters = clusters.loc[:, ["code", "depcom_2018", "geometry"]]
    clusters_gdf = gpd.GeoDataFrame(clusters, geometry="geometry", crs="EPSG:4326")

    return clusters_gdf


def dataframe_to_parquet_bytes(data: pd.DataFrame, compression: str = "snappy") -> bytes:
    """
    Converts a Pandas DataFrame into a Parquet file stored in memory as bytes.

    Parameters:
    -----------
    data : pd.DataFrame
        The DataFrame to be converted into Parquet format.

    compression : str, optional (default: "snappy")
        The compression algorithm to use when writing the Parquet file.
        Options include "snappy", "gzip", "brotli", "zstd", etc.

    Returns:
    --------
    bytes
        A bytes object representing the Parquet file.

    Notes:
    ------
    - Uses Apache Arrow (`pyarrow`) to convert the DataFrame into an in-memory Parquet file.
    - The Parquet file can be stored, sent over a network, or written to disk as needed.
    - The default compression is "snappy" for fast and efficient compression.

    Example:
    --------
    ```python
    data = pd.DataFrame({"A": [1, 2, 3], "B": ["x", "y", "z"]})
    parquet_bytes = dataframe_to_parquet_bytes(data)

    # To save to a file
    with open("data.parquet", "wb") as f:
        f.write(parquet_bytes)
    ```
    """
    # Create an in-memory buffer
    buf = pa.BufferOutputStream()

    # Convert DataFrame to Arrow Table
    table = pa.Table.from_pandas(data)

    # Write Table to Parquet format in memory
    pq.write_table(table, buf, compression=compression)

    # Return bytes representation of the buffer
    return buf.getvalue().to_pybytes()
