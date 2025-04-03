import sys

from utils.wrappers import dataframe_to_parquet_bytes, get_data_evol

available_years = ["2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"]
dep = "MAYOTTE"
model_name = "Segmentation-multiclass"
model_version = "1"

data = get_data_evol(dep, available_years, model_name, model_version)

buf_bytes = dataframe_to_parquet_bytes(data)

# Write the bytes to standard output
sys.stdout.buffer.write(buf_bytes)
