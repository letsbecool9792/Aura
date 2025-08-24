# ml/analyze_medicine.py

import sys
import os
import json
import pandas as pd
import regex as re
from PIL import Image
import google.generativeai as genai
from thefuzz import process, fuzz
from dotenv import load_dotenv
import signal
import time

# IMPORTANT: The Django backend will execute this script from the `/backend/` directory.
# Therefore, we need to construct the paths relative to that location.
# ../ml/ will point from /backend/ to /ml/
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) # This gets the root project directory
DB_PATH = os.path.join(BASE_DIR, 'ml', 'Extensive_A_Z_medicines_dataset_of_India.csv')
ENV_PATH = os.path.join(BASE_DIR, 'backend', '.env') # Assuming .env is in the backend folder

def run_analysis(image_path):
    try:
        load_dotenv(dotenv_path=ENV_PATH)
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in .env file.")
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
    except Exception as e:
        return json.dumps({"status": "error", "message": f"API Configuration failed: {e}"})

    try:
        medicine_db = pd.read_csv(DB_PATH)
        medicine_db['short_composition1'] = medicine_db['short_composition1'].fillna('')
        medicine_db['short_composition2'] = medicine_db['short_composition2'].fillna('')
        medicine_db['composition'] = medicine_db['short_composition1'] + ' ' + medicine_db['short_composition2']
        medicine_db['composition'] = medicine_db['composition'].str.strip()
        medicine_names = medicine_db['name'].dropna().tolist()
        medicine_compositions = medicine_db['composition'].dropna().unique().tolist()
    except Exception as e:
        return json.dumps({"status": "error", "message": f"Database loading failed: {e}"})

    def find_best_match_robustly(extracted_term, choices):
        if not extracted_term or len(extracted_term) < 3: return None, 0
        best_match, score = process.extractOne(extracted_term, choices, scorer=fuzz.token_set_ratio)
        return best_match, score

    def intelligent_search(gemini_output):
        brand_name = gemini_output.get("brand_name")
        composition = gemini_output.get("composition")
        best_brand_match, score_brand = find_best_match_robustly(brand_name, medicine_names)
        best_comp_match, score_comp = find_best_match_robustly(composition, medicine_compositions)
        if score_brand >= score_comp:
            return best_brand_match, score_brand, 'name'
        else:
            return best_comp_match, score_comp, 'composition'

    try:
        original_image = Image.open(image_path).convert("RGB")
        
        # Resize image to reduce processing time while maintaining quality
        max_size = (1024, 1024)
        original_image.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        prompt = """You are an expert pharmacy assistant. Analyze the image of the medicine packaging. Extract the following information and return it as a clean JSON object: "brand_name", "composition", "manufacturer". If a field is not visible, return "N/A". Do not include any text outside the JSON."""
        
        # Add timeout for Gemini API call
        start_time = time.time()
        response = model.generate_content([prompt, original_image])
        elapsed_time = time.time() - start_time
        
        if elapsed_time > 120:  # If taking more than 2 minutes
            return json.dumps({"status": "error", "message": "Gemini API response took too long"})
        
        clean_json_str = response.text.strip().replace('```json', '').replace('```', '')
        gemini_data = json.loads(clean_json_str)

        if not gemini_data.get("brand_name") and not gemini_data.get("composition"):
            return json.dumps({"status": "error", "message": "Gemini could not identify key information."})

        best_match, score, match_col = intelligent_search(gemini_data)
        
        if score >= 85:
            matched_row = medicine_db[medicine_db[match_col] == best_match].iloc[0]
            result = {
                "status": "success",
                "match_confidence": score,
                "data": {
                    "brand_name": matched_row.get('name', 'N/A'),
                    "composition": matched_row.get('composition', 'N/A'),
                    "manufacturer": matched_row.get('manufacturer_name', 'N/A'),
                    "price_inr": matched_row.get('price(₹)', 'N/A'),
                    "pack_size": matched_row.get('pack_size_label', 'N/A'),
                }
            }
            return json.dumps(result)
        else:
            return json.dumps({"status": "low_confidence", "message": "Could not reliably verify.", "match_confidence": score, "closest_match": best_match})

    except Exception as e:
        return json.dumps({"status": "error", "message": f"An error occurred during analysis: {str(e)}"})

if __name__ == "__main__":
    if len(sys.argv) > 1:
        image_file_path = sys.argv[1]
        analysis_result = run_analysis(image_file_path)
        print(analysis_result)
    else:
        print(json.dumps({"status": "error", "message": "No image path provided."}))
