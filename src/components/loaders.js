// loaders.js
import {getConfig} from "./config.js";

export async function loadDepartmentGeom(department) {
    const config = getConfig(department);
    if (!config) {
      throw new Error(`Department ${department} not configured`);
    }
    
  
    try {
      if (config.geomFile) {
        const fileAttachment = config.geomFile();
        return await fileAttachment.json();
      }
    } catch (dataLoadError) {
      console.warn(`No data file found for ${department}:`, dataLoadError);
    }
    
  }


export async function loadDepartmentLevel(department) {
    const config = getConfig(department);
    if (!config) {
      throw new Error(`Department ${department} not configured`);
    }
    
  
    try {
      if (config.levelFile) {
        const fileAttachment = config.levelFile();
        return await fileAttachment.parquet();
      }
    } catch (dataLoadError) {
      console.warn(`No data file found for ${department}:`, dataLoadError);
    }
    
  }


export async function loadDepartmentEvol(department) {
    const config = getConfig(department);
    if (!config) {
      throw new Error(`Department ${department} not configured`);
    }
    
  
    try {
      if (config.evolFile) {
        const fileAttachment = config.evolFile();
        return await fileAttachment.parquet();
      }
    } catch (dataLoadError) {
      console.warn(`No data file found for ${department}:`, dataLoadError);
    }
    
  }

export async function loadDepartmentConstructions(department) {
    const config = getConfig(department);
    if (!config) {
      throw new Error(`Department ${department} not configured`);
    }
    
  
    try {
      if (config.constructionsFile) {
        const fileAttachment = config.constructionsFile();
        return await fileAttachment.json();
      }
    } catch (dataLoadError) {
      console.warn(`No data file found for ${department}:`, dataLoadError);
    }
    
  }

export async function loadDepartmentDestructions(department) {
    const config = getConfig(department);
    if (!config) {
      throw new Error(`Department ${department} not configured`);
    }
    
  
    try {
      if (config.destructionsFileFile) {
        const fileAttachment = config.destructionsFile();
        return await fileAttachment.json();
      }
    } catch (dataLoadError) {
      console.warn(`No data file found for ${department}:`, dataLoadError);
    }
    
  }
