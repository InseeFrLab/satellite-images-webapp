from utils.wrappers import get_cluster_geom

dep = "SAINT-MARTIN"

clusters = get_cluster_geom(dep)

print(clusters.to_json())
