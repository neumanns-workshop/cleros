#!/usr/bin/env python3
import requests
import json
from datetime import datetime, timedelta
import pytz
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv
import os
import base64
from math import cos, pi
import argparse
import re
from skyfield.api import load, Topos
import inflect # Import inflect
from sentence_transformers import SentenceTransformer
import hashlib
import numpy as np
import struct

# Load environment variables
load_dotenv()

# Initialize Skyfield timescale and ephemeris globally to avoid reloading
ts = load.timescale()
eph = load('de421.bsp') # Load ephemeris (downloads if needed)

def parse_arguments():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description='Get local context information')
    parser.add_argument('--no-weather', action='store_true', help='Skip weather API calls')
    parser.add_argument('--no-birds', action='store_true', help='Skip bird data API calls')
    parser.add_argument('--no-biology', action='store_true', help='Skip biological observation API calls')
    parser.add_argument('--no-astronomy', action='store_true', help='Skip astronomical data API calls')
    parser.add_argument('--no-solar', action='store_true', help='Skip NASA solar activity API calls')
    parser.add_argument('--api', choices=['all', 'weather', 'birds', 'biology', 'astronomy'], 
                        default='all', help='Only call the specified API')
    return parser.parse_args()

class LocalContext:
    def __init__(self, args=None):
        self.args = args or parse_arguments()
        self.ip: Optional[str] = self._get_ip()
        self.location_data: Dict[str, Any] = self._get_location_data() if self.ip else {}
        self.timezone: str = self.location_data.get('timezone', 'UTC') # Keep timezone fallback for datetime objects
        
    def _get_ip(self) -> Optional[str]:
        """Get the current IP address. Returns None on failure."""
        # --- Temporary Hardcoded IP for Testing --- #
        # Updated IP for testing
        # print("--- WARNING: Using hardcoded IP 36.211.178.169 for testing --- ") # Remove/Comment out
        # return "36.211.178.169" # Remove/Comment out
        # return "81.63.156.29" # Previous test IP # Remove/Comment out
        # --- End Temporary Code ---

        # --- Original Code ---
        try:
            response = requests.get('https://api.ipify.org?format=json', timeout=5)
            response.raise_for_status()
            return response.json().get('ip')
        except requests.exceptions.RequestException as e:
            print(f"Error getting IP: {e}") # Re-enable print for errors
            return None
        except json.JSONDecodeError:
            print(f"Error decoding IP response") # Re-enable print for errors
            return None
        # --- End Original Code ---

    def _get_location_data(self) -> Dict[str, Any]:
        """Get location data based on IP address. Returns empty dict on failure."""
        if not self.ip:
            return {}
        try:
            response = requests.get(f'http://ip-api.com/json/{self.ip}', timeout=5)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            # print(f"Error getting location data: {e}") # Suppressed error message
            return {}
        except json.JSONDecodeError:
            # print(f"Error decoding location data") # Suppressed error message
            return {}

    def get_weather(self) -> Dict[str, Any]:
        """Get weather data. Returns empty dict if skipped, on key error, coordinate error, or API error."""
        if self.args.no_weather or (self.args.api != 'all' and self.args.api != 'weather'):
            return {}
            
        api_key = os.getenv('VISUALCROSSING_API_KEY')
        if not api_key:
            # print("Warning: VISUALCROSSING_API_KEY not found") # Suppressed
            return {}
            
        lat = self.location_data.get('lat')
        lon = self.location_data.get('lon')
        if not lat or not lon:
            # print(f"Warning: Missing coordinates for weather") # Suppressed
            return {}
                
        try:
            base_url = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline"
            location = f"{lat},{lon}"
            
            params = {
                'key': api_key,
                'unitGroup': 'metric',
                'include': 'current,days',
                'contentType': 'json'
            }
            
            url = f"{base_url}/{location}"
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            # print(f"Network error while fetching weather: {str(e)}") # Suppressed
            return {}
        except json.JSONDecodeError as e:
            # print(f"Error decoding weather API response: {str(e)}") # Suppressed
            return {}
        except Exception as e:
            # print(f"Unexpected error getting weather: {str(e)}") # Suppressed
            return {}

    def get_celestial_data(self) -> Dict[str, Any]:
        """DEPRECATED - Combined into get_astronomical_data."""
        # This method is no longer used directly, functionality moved
        return {}

    def get_seasonal_info(self) -> Dict[str, Any]:
        """Get seasonal information. Returns empty dict on error."""
        try:
            now = datetime.now(pytz.timezone(self.timezone))
            month = now.month
            season = ""
            # Basic Northern Hemisphere seasons
            if month in [12, 1, 2]:
                season = "Winter"
            elif month in [3, 4, 5]:
                season = "Spring"
            elif month in [6, 7, 8]:
                season = "Summer"
            elif month in [9, 10, 11]:
                season = "Autumn"

            # Only return if season was determined
            if season:
                return {
                    'season': season,
                    'is_weekend': now.weekday() >= 5
                }
            else:
                return {}
        except Exception:
            # print(f"Error getting seasonal info: {e}") # Suppressed
            return {}

    def get_local_time(self) -> Dict[str, Any]:
        """Get local time information. Returns empty dict on error."""
        try:
            local_time = datetime.now(pytz.timezone(self.timezone))
            hour = local_time.hour
            time_of_day = ""
            if 5 <= hour < 12:
                time_of_day = 'morning'
            elif 12 <= hour < 17:
                time_of_day = 'afternoon'
            elif 17 <= hour < 21:
                time_of_day = 'evening'
            else:
                time_of_day = 'night'

            if time_of_day:
                return {
                    'time': local_time.strftime('%H:%M'), # Removed seconds
                    'date': local_time.strftime('%B %-d, %Y'),
                    'time_of_day': time_of_day
                }
            else:
                return {}
        except Exception:
            # print(f"Error getting local time: {e}") # Suppressed
            return {}

    def _get_time_of_day(self, hour: int) -> str:
        """Helper - Determine time of day based on hour."""
        # Logic moved inside get_local_time to avoid returning empty dict
        pass

    def get_bird_data(self) -> Dict[str, Any]:
        """Get recent bird sightings. Returns empty dict if skipped, on key error, coordinate error, or API error."""
        if self.args.no_birds or (self.args.api != 'all' and self.args.api != 'birds'):
            return {}
            
        api_key = os.getenv('EBIRD_API_KEY')
        if not api_key:
            # print("Warning: EBIRD_API_KEY not found") # Suppressed
            return {}
                
        lat = self.location_data.get('lat')
        lon = self.location_data.get('lon')
        if not lat or not lon:
             # print(f"Warning: Missing coordinates for birds") # Suppressed
             return {}
                
        try:
            headers = {'X-eBirdApiToken': api_key}
            # Get recent observations within 25km radius
            url = f"https://api.ebird.org/v2/data/obs/geo/recent?lat={lat}&lng={lon}&dist=25"
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            observations = response.json()

            # Process valid observations only
            recent_sightings = []
            if isinstance(observations, list):
                for obs in observations:
                    # Ensure obs is a dictionary and has required keys
                    if isinstance(obs, dict) and 'comName' in obs and 'obsDt' in obs:
                         # Keep basic info, count is less relevant now
                         sighting = {
                             'species': obs['comName']
                             # Add other fields if needed later, e.g., obs['locName']
                         }
                         recent_sightings.append(sighting)

            # Return sightings if any were processed
            if recent_sightings:
                return {'recent_sightings': recent_sightings[:5]} # Limit output size
            else:
                return {}
        except requests.exceptions.RequestException:
            # print(f"Error getting bird data: {e}") # Suppressed
            return {}
        except json.JSONDecodeError:
            # print(f"Error decoding bird data") # Suppressed
            return {}
        except Exception:
            # print(f"Unexpected error getting bird data: {e}") # Suppressed
            return {}

    def get_biological_observations(self) -> Dict[str, Any]:
        """Get biological observations. Returns empty dict if skipped, coordinate error, or API error."""
        if self.args.no_biology or (self.args.api != 'all' and self.args.api != 'biology'):
            return {}
            
        lat = self.location_data.get('lat')
        lon = self.location_data.get('lon')
        if not lat or not lon:
            # print(f"Warning: Missing coordinates for biology") # Suppressed
            return {}
            
        try:
            url = f"https://api.inaturalist.org/v1/observations"
            params = {
                'lat': lat,
                'lng': lon,
                'radius': 25,
                'order': 'desc',
                'order_by': 'observed_on', # Order by observation date
                'per_page': 50, # Limit results
                'quality_grade': 'research,needs_id',
                # Removed strict date filter to get more recent observations
                # 'observed_on': datetime.now().strftime('%Y-%m-%d') # Only today's observations
            }

            response = requests.get(url, params=params, timeout=15)
            response.raise_for_status()
            data = response.json()
            observations = data.get('results', [])

            formatted_observations = []
            if isinstance(observations, list):
                for obs in observations:
                    # Check if obs is dict and has taxon info
                    if isinstance(obs, dict) and 'taxon' in obs and isinstance(obs['taxon'], dict):
                        taxon = obs['taxon']
                        # Require common name and species name
                        common_name = taxon.get('preferred_common_name')
                        species = taxon.get('name')
                        # iconic_taxon = taxon.get('iconic_taxon_name') # No longer needed

                        if common_name and species: # Removed iconic_taxon check
                            formatted_observations.append({
                                'common_name': common_name,
                                'species': species,
                                # 'category': iconic_taxon # Removed category
                            })

            if formatted_observations:
                 return {'observations': formatted_observations}
            else:
                 return {}
        except requests.exceptions.RequestException:
            # print(f"Error getting biological observations: {e}") # Suppressed
            return {}
        except json.JSONDecodeError:
            # print(f"Error decoding biology data") # Suppressed
            return {}
        except Exception:
            # print(f"Unexpected error getting biology observations: {e}") # Suppressed
            return {}

    def get_astronomical_data(self) -> Dict[str, Any]:
        """Get astronomical data. Returns empty dict if skipped, coordinate error, or API error."""
        if self.args.no_astronomy or (self.args.api != 'all' and self.args.api != 'astronomy'):
            return {}
            
        lat = self.location_data.get('lat')
        lon = self.location_data.get('lon')
        if not lat or not lon:
            # print(f"Warning: Missing coordinates for astronomy") # Suppressed
            return {}
            
        now = datetime.now()
        nasa_api_key = os.getenv('NASA_API_KEY')
        astro_data = {}
        
        # 1. Sun data
        try:
            sun_url = f'https://api.sunrise-sunset.org/json?lat={lat}&lng={lon}&formatted=0&date={now.strftime("%Y-%m-%d")}'
            sun_response = requests.get(sun_url, timeout=5)
            sun_response.raise_for_status()
            sun_results = sun_response.json().get('results')

            if sun_results and all(k in sun_results for k in ('sunrise', 'sunset', 'day_length')):
                 def convert_utc_to_local_time(utc_time_str):
                     try:
                         utc_time = datetime.fromisoformat(utc_time_str.replace('Z', '+00:00'))
                         local_time = utc_time.astimezone()
                         return local_time.strftime('%H:%M')
                     except ValueError:
                         return None

                 rise_time = convert_utc_to_local_time(sun_results['sunrise'])
                 set_time = convert_utc_to_local_time(sun_results['sunset'])
                 day_len_sec = int(float(sun_results['day_length']))
                 day_len_str = str(timedelta(seconds=day_len_sec))

                 if rise_time and set_time and day_len_str:
                     astro_data['sun'] = {
                         'rise': rise_time,
                         'set': set_time,
                         'day_length': day_len_str
                     }
        except requests.exceptions.RequestException:
             pass # Silently fail sun data
        except (json.JSONDecodeError, KeyError, ValueError, TypeError):
             pass # Silently fail sun data

        # 2. NASA DONKI data (Solar Activity)
        solar_activity = []
        if nasa_api_key and not self.args.no_solar:
            try:
                nasa_url = f"https://api.nasa.gov/DONKI/notifications"
                nasa_params = {
                    'api_key': nasa_api_key,
                    'startDate': (now - timedelta(days=3)).strftime('%Y-%m-%d'), # Shorter window
                    'endDate': now.strftime('%Y-%m-%d'),
                    'type': 'all' # Get all types initially
                }
                nasa_response = requests.get(nasa_url, params=nasa_params, timeout=10)
                nasa_response.raise_for_status()
                solar_data = nasa_response.json()

                if isinstance(solar_data, list):
                    for event in solar_data:
                         # Only consider CME, FLR, SEP events
                         msg_type = event.get('messageType')
                         msg_body = event.get('messageBody')
                         if msg_type in ['CME', 'FLR', 'SEP'] and isinstance(msg_body, str):
                             solar_activity.append({'type': msg_type, 'message': msg_body})
            except requests.exceptions.RequestException:
                 pass # Silently fail solar data
            except (json.JSONDecodeError, KeyError, ValueError, TypeError):
                 pass # Silently fail solar data

        if solar_activity:
             astro_data['solar_activity'] = solar_activity[:3] # Limit output

        # 3. Moon Phase Calculation (Simplified)
        try:
            year, month, day = now.year, now.month, now.day
            if month <= 2: year -= 1; month += 12
            a = year // 100; b = a // 4; c = 2 - a + b
            e = int(365.25 * (year + 4716)); f = int(30.6001 * (month + 1))
            jd = c + day + e + f - 1524.5
            days_since_new = (jd - 2451549.5) % 29.530588853
            moon_age = days_since_new
            phase_angle = (moon_age / 29.530588853) * 360
            illumination = 50 * (1 - cos(phase_angle * pi / 180))

            moon_phase = ""
            if moon_age < 1.84566: moon_phase = "New"
            elif moon_age < 5.53699: moon_phase = "Waxing Crescent"
            elif moon_age < 9.22831: moon_phase = "First Quarter"
            elif moon_age < 12.91963: moon_phase = "Waxing Gibbous"
            elif moon_age < 16.61096: moon_phase = "Full"
            elif moon_age < 20.30228: moon_phase = "Waning Gibbous"
            elif moon_age < 23.99361: moon_phase = "Last Quarter"
            elif moon_age < 27.68493: moon_phase = "Waning Crescent"
            else: moon_phase = "New"

            if moon_phase:
                 astro_data['moon'] = {
                     'phase': moon_phase,
                     'illumination': f"{illumination:.1f}%",
                     'visible': illumination > 10
                 }
        except Exception:
            pass # Silently fail moon calculation

        # 4. Planet Visibility using Skyfield
        visible_planets = []
        try:
            observer = Topos(latitude_degrees=lat, longitude_degrees=lon)
            t = ts.now() # Use current time
            sun = eph['sun']
            earth = eph['earth']
            sun_alt, _, _ = (earth + observer).at(t).observe(sun).apparent().altaz()

            # Only check planets if sun is below horizon (approx < -6 deg)
            if sun_alt.degrees < -6:
                planet_names = ['mercury', 'venus', 'mars', 'jupiter', 'saturn']
                for name in planet_names:
                    planet = eph[name + ' barycenter']
                    astrometric = (earth + observer).at(t).observe(planet).apparent()
                    alt, _, _ = astrometric.altaz()
                    # Consider visible if above 5 degrees altitude
                    if alt.degrees > 5:
                        visible_planets.append(name.capitalize())
        except Exception:
             pass # Silently fail planet visibility calculation

        if visible_planets:
             # Create 'tonight' structure only if planets are visible
             astro_data['tonight'] = {'visible_planets': visible_planets}

        # Only return if we successfully gathered some astro data
        return astro_data if astro_data else {}

    def _get_empty_astro_data(self):
        """DEPRECATED - No longer needed with silent failures."""
        pass

    def get_all_context(self) -> Dict[str, Any]:
        """Get all available context data, skipping sections on failure."""
        # Data fetching methods now return {} on failure/skip
        all_data = {
            'location': self.location_data,
            'weather': self.get_weather(),
            'time': self.get_local_time(),
            'seasonal': self.get_seasonal_info(),
            'birds': self.get_bird_data(),
            'biology': self.get_biological_observations(),
            'sky': self.get_astronomical_data()
        }
        # Add IP only if successfully retrieved
        if self.ip:
            all_data['ip'] = self.ip

        # Filter out empty dictionaries before returning
        return {k: v for k, v in all_data.items() if v}

    def generate_summary(self, all_data: Dict[str, Any]) -> List[str]:
        """Generate declarative fact statements. Skips facts if data is missing."""
        facts = []
        p = inflect.engine() # Initialize inflect engine

        # Helper function to format species facts grammatically
        def format_species_fact(common_name, species_name=None):
            article_form = p.a(common_name) # Check for "a" or "an"
            ends_in_s = common_name.lower().endswith('s')

            # Determine verb and subject formatting based on inflect and heuristic
            if not article_form: # Inflect correctly identifies as plural (or uncountable needing no article)
                formatted_subject = common_name.capitalize()
                fact_verb = "were"
            elif article_form and not ends_in_s: # Inflect identifies as singular, doesn't end in 's' -> trust inflect
                formatted_subject = article_form[0].upper() + article_form[1:]
                fact_verb = "was"
            elif article_form and ends_in_s: # Inflect says singular, but ends in 's' -> override, assume plural
                formatted_subject = common_name.capitalize()
                fact_verb = "were"
            else: # Fallback case (shouldn't happen often) - default to singular was
                formatted_subject = common_name.capitalize()
                fact_verb = "was"

            # Add species name if provided
            if species_name:
                 # Ensure species name isn't added twice if it was part of article_form processing
                 if article_form and not ends_in_s:
                     formatted_subject += f" ({species_name})" 
                 else:
                      # For plural cases or overrides, append species name directly
                      formatted_subject += f" ({species_name})"

            # Removed " recently"
            return f"{formatted_subject} {fact_verb} observed."

        # Location facts
        if 'location' in all_data:
            loc = all_data['location']
            city = loc.get('city')
            country = loc.get('country')
            if city and country:
                 facts.append(f"The location is {city}, {country}.")

        # Time facts
        if 'time' in all_data:
            time_data = all_data['time']
            time_of_day = time_data.get('time_of_day')
            date_val = time_data.get('date')
            if time_of_day:
                 facts.append(f"It is {time_of_day}.")
            if date_val:
                 # Reverted change, date_val is now pre-formatted
                 facts.append(f"The date is {date_val}.")
                 # facts.append(f"The date is {local_time.strftime('%B %d, %Y')}.") # Incorrect edit reverted

        # Season facts
        if 'seasonal' in all_data:
            seasonal = all_data['seasonal']
            season_val = seasonal.get('season')
            is_weekend = seasonal.get('is_weekend') # Bool, check existence
            if season_val:
                 facts.append(f"The season is {season_val}.")
            if 'is_weekend' in seasonal: # Check key existence for boolean
                 if is_weekend:
                     facts.append("Today is a weekend day.")
                 else:
                     facts.append("Today is a weekday.")

        # Weather facts
        if 'weather' in all_data:
            weather = all_data['weather']
            current = weather.get('currentConditions')

            if isinstance(current, dict):
                conditions = current.get('conditions')
                if conditions:
                    # Removed "current", added lowercasing
                    facts.append(f"The weather conditions are {conditions.lower()}.")
                    # Specific condition derived facts
                    if isinstance(conditions, str):
                        # Ensure conditions are compared in lowercase
                        lower_conditions = conditions.lower()
                        if 'rain' in lower_conditions or 'shower' in lower_conditions:
                            facts.append("Precipitation type: Rain.")
                        elif 'snow' in lower_conditions:
                            facts.append("Precipitation type: Snow.")
                        elif 'cloud' in lower_conditions:
                            facts.append("Cloud cover is present.")
                        elif 'clear' in lower_conditions or 'sunny' in lower_conditions:
                            facts.append("The sky is clear.")

        # Astronomical facts
        if 'sky' in all_data:
            sky = all_data['sky']
            moon_data = sky.get('moon')
            tonight_data = sky.get('tonight')
            solar_activity = sky.get('solar_activity')

            if isinstance(moon_data, dict):
                phase = moon_data.get('phase')
                visible = moon_data.get('visible') # Bool, check existence
                if phase:
                    facts.append(f"The moon is in its {phase.lower()} phase.")
                if 'visible' in moon_data:
                    if visible:
                        facts.append("The moon will be visible tonight.")

            if isinstance(tonight_data, dict):
                 planets = tonight_data.get('visible_planets')
                 if isinstance(planets, list) and planets:
                     facts.append(f"Planets visible tonight: {', '.join(planets)}.")

            if isinstance(solar_activity, list) and solar_activity:
                # Parse solar activity only if data exists
                solar_targets = {}
                solar_severity = {}
                for event in solar_activity:
                    event_type = event.get('type')
                    msg = event.get('message')
                    if not event_type or not isinstance(msg, str):
                        continue # Skip malformed events

                    severity = 'low' # Default severity
                    if event_type == 'FLR':
                        if 'X-class' in msg or 'X class' in msg: severity = 'high'
                        elif 'M-class' in msg or 'M class' in msg: severity = 'moderate'
                    elif event_type == 'SEP': severity = 'high'
                    elif event_type == 'CME':
                        if 'halo' in msg.lower() or 'fast' in msg.lower(): severity = 'high'
                        else: severity = 'moderate' # Assume moderate for non-fast/halo CMEs

                    # Track the highest severity detected across all relevant events
                    # Use a simple approach: store the highest level found
                    current_max_severity = solar_severity.get('overall', 'low')
                    if severity_level(severity) > severity_level(current_max_severity):
                        solar_severity['overall'] = severity

                # Add summarized fact based on highest detected severity
                overall_severity = solar_severity.get('overall')
                if overall_severity:
                    if overall_severity == 'high':
                        facts.append("High-severity solar activity has been detected.")
                    elif overall_severity == 'moderate':
                        facts.append("Moderate-severity solar activity has been detected.")
                    else: # Low severity
                        facts.append("Minor solar activity has been detected.")

        # Biological facts
        if 'biology' in all_data:
            bio = all_data['biology']
            observations = bio.get('observations')

            if isinstance(observations, list) and observations:
                # Removed total observation count fact
                # facts.append(f"There are {len(observations)} wildlife observations recorded in the area recently.")

                # Removed classification lists and logic
                # plants, insects, birds, mammals, others = [], [], [], [], []
                # reptiles, amphibians, mollusks = [], [], []

                # Directly report unique observed species up to a limit
                observed_species_facts = []
                unique_species_set = set()
                limit = 3 # Limit the number of unique species facts

                for obs in observations:
                    if len(observed_species_facts) >= limit:
                        break # Stop after reaching the limit

                    if isinstance(obs, dict):
                        name = obs.get('common_name')
                        species = obs.get('species')
                        if name and species:
                            # Use helper for grammatical formatting
                            fact_text = format_species_fact(name, species)
                            species_identifier = f"{name} ({species})" # Use combined for uniqueness tracking
                            if species_identifier not in unique_species_set:
                                observed_species_facts.append(fact_text)
                                unique_species_set.add(species_identifier)

                facts.extend(observed_species_facts) # Add generated facts

                # Removed old reporting logic
                # def report_observations(category_name, obs_list):
                #    ...
                # report_observations("plant", plants)
                # ... etc ...

        # Bird facts (from eBird)
        if 'birds' in all_data:
            birds_data = all_data['birds']
            recent_birds = birds_data.get('recent_sightings')

            if isinstance(recent_birds, list) and recent_birds:
                sighted_species = list(dict.fromkeys([b.get('species') for b in recent_birds if isinstance(b, dict) and b.get('species')]))
                if sighted_species:
                    # Use helper for grammatical formatting for eBird species
                    unique_ebird_set = set() # Track unique ebird species added
                    for species_name in sighted_species:
                        if len(unique_ebird_set) >= 3: # Limit to 3 unique facts
                            break
                        if species_name not in unique_ebird_set:
                             fact_text = format_species_fact(species_name) # No scientific name here
                             facts.append(fact_text)
                             unique_ebird_set.add(species_name)

        return facts

# Helper function for determining severity level (for comparisons)
def severity_level(severity: str) -> int:
    """Convert severity string to numeric level for comparison."""
    if severity == 'high': return 3
    if severity == 'moderate': return 2
    if severity == 'low': return 1
    return 0

# Helper function to capitalize severity for readable output
def capitalize_severity(severity: str) -> str:
    """Make severity string more readable."""
    if severity == 'high': return 'High'
    if severity == 'moderate': return 'Moderate'
    if severity == 'low': return 'Low'
    return 'Unknown' # Should not be reached if logic is correct

def main():
    args = parse_arguments()
    context = LocalContext(args)
    all_data = context.get_all_context()

    # --- Configuration ---
    HYMN_COUNT = 121 # Define the total number of hymns (for range 1 to N)
    MODEL_NAME = 'all-MiniLM-L6-v2' # Embedding model
    # --- End Configuration ---

    # Get facts, filtering ensures only valid data is used
    facts = context.generate_summary(all_data)

    # Only proceed if facts were generated
    if facts:
        print(f"Generated {len(facts)} context facts.")

        # --- Generate Selection Number from Context Embeddings ---
        try:
            print(f"Loading embedding model: {MODEL_NAME}...")
            model = SentenceTransformer(MODEL_NAME)
            print("Encoding facts...")
            embeddings = model.encode(facts)

            if embeddings.ndim == 2 and embeddings.shape[0] > 0:
                print("Calculating context vector...")
                sum_vector = np.sum(embeddings, axis=0)

                # Determine struct format based on embedding dimension
                embedding_dim = sum_vector.size
                format_string = f'{embedding_dim}f' # Assuming float32 embeddings

                print("Hashing context vector...")
                vector_bytes = struct.pack(format_string, *sum_vector)
                sha256_hash = hashlib.sha256(vector_bytes).digest()

                # Convert hash to integer and map to hymn range
                hash_int = int.from_bytes(sha256_hash[:8], byteorder='big', signed=False)
                selection_number = (hash_int % HYMN_COUNT) + 1

                print("\n" + "=" * 50)
                print(f"CONTEXT-DERIVED SELECTION (1-{HYMN_COUNT}): {selection_number}")
                print("=" * 50)
            else:
                print("Error: Could not generate valid embeddings.")

        except Exception as e:
            print(f"\nError during embedding/hashing process: {e}")
            print("Could not generate selection number.")
        # --- End Selection Number Generation ---

        print("\nLOCAL CONTEXT FACTS:")
        for fact in facts:
            print(f"• {fact}")
        print("=" * 50)
    else:
        print("No local context facts could be generated.")

if __name__ == "__main__":
    main() 