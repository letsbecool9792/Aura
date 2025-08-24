#!/usr/bin/env python3
"""
Test script for the medicine analysis functionality.
Run this from the backend directory to test the analyze_medicine.py script.
"""

import sys
import os
import json
from pathlib import Path

# Add the ml directory to the path so we can import the analysis script
project_root = Path(__file__).parent.parent
ml_dir = project_root / 'ml'
sys.path.insert(0, str(ml_dir))

from analyze_medicine import run_analysis

def test_analysis():
    """Test the medicine analysis with a sample image."""
    
    # Check if the CSV database exists
    csv_path = project_root / 'ml' / 'Extensive_A_Z_medicines_dataset_of_India.csv'
    if not csv_path.exists():
        print(f"❌ Database file not found: {csv_path}")
        return False
    
    print(f"✅ Database file found: {csv_path}")
    
    # Check if there are any medicine images in the dataset
    medicine_images_dir = project_root / 'ml' / 'Medicine_data' / 'Medicine_data'
    if not medicine_images_dir.exists():
        print(f"❌ Medicine images directory not found: {medicine_images_dir}")
        return False
    
    # Find the first image file
    image_files = list(medicine_images_dir.glob('*.jpg')) + list(medicine_images_dir.glob('*.jpeg')) + list(medicine_images_dir.glob('*.png'))
    
    if not image_files:
        print(f"❌ No image files found in: {medicine_images_dir}")
        return False
    
    test_image = image_files[0]
    print(f"✅ Found test image: {test_image}")
    
    # Test the analysis
    try:
        print("🔍 Running analysis...")
        result = run_analysis(str(test_image))
        result_data = json.loads(result)
        
        print("📊 Analysis Result:")
        print(json.dumps(result_data, indent=2))
        
        if result_data.get('status') == 'success':
            print("✅ Analysis completed successfully!")
            return True
        elif result_data.get('status') == 'low_confidence':
            print("⚠️ Analysis completed with low confidence")
            return True
        else:
            print(f"❌ Analysis failed: {result_data.get('message', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"❌ Error during analysis: {str(e)}")
        return False

if __name__ == "__main__":
    print("🧪 Testing Medicine Analysis Script")
    print("=" * 50)
    
    success = test_analysis()
    
    if success:
        print("\n✅ Test completed successfully!")
        print("The medicine analysis script is ready for use.")
    else:
        print("\n❌ Test failed!")
        print("Please check the error messages above and fix any issues.")
        print("\nMake sure you have:")
        print("1. Set your GEMINI_API_KEY in backend/.env")
        print("2. The CSV database file in ml/")
        print("3. Sample medicine images in ml/Medicine_data/Medicine_data/")
