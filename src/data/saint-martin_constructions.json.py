import sys

from utils.wrappers import dataframe_to_parquet_bytes, get_build_evol

available_years = ["2024"]
dep = "SAINT-MARTIN"
model_name = "Segmentation-multiclass"
model_version = "1"

data = get_build_evol(dep, available_years, model_name, model_version, "constructions")
print(data.to_json())