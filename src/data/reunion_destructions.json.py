import sys

from utils.wrappers import dataframe_to_parquet_bytes, get_build_evol

available_years = ["2018", "2022", "2023"]
dep = "REUNION"
model_name = "Segmentation-multiclass"
model_version = "1"

data = get_build_evol(dep, available_years, model_name, model_version, "destructions")
print(data.to_json())
