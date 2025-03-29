#!/usr/bin/env python3
"""
Visualize Deity Classifications

This script generates visualizations of deity classifications from the Sortes Orphicae project.
It displays the distribution of deity types and attributes in a user-friendly format.
"""

import json
import argparse
from pathlib import Path
import matplotlib.pyplot as plt
import pandas as pd
from typing import Dict, List, Any
import seaborn as sns
from collections import Counter

# Constants
DATA_DIR = Path("data")
DEITIES_DIR = DATA_DIR / "enriched" / "deities"
DEFAULT_INPUT = DEITIES_DIR / "deity_classifications.json"

def load_classifications(input_file: str = str(DEFAULT_INPUT)) -> List[Dict[str, Any]]:
    """Load deity classifications from JSON file"""
    try:
        with open(input_file, 'r') as f:
            classifications = json.load(f)
        
        print(f"Loaded {len(classifications)} deity classifications from {input_file}")
        return classifications
    except Exception as e:
        print(f"Error loading classifications: {e}")
        return []

def create_category_pie_chart(classifications: List[Dict[str, Any]], output_file: str = None) -> None:
    """Create a pie chart of deity categories"""
    # Extract categories
    categories = [c.get('category', 'Unknown') for c in classifications]
    category_counts = Counter(categories)
    
    # Create figure
    plt.figure(figsize=(10, 7))
    
    # Create pie chart
    plt.pie(
        category_counts.values(), 
        labels=category_counts.keys(),
        autopct='%1.1f%%', 
        startangle=90,
        explode=[0.05] * len(category_counts),
        shadow=True,
        wedgeprops={'edgecolor': 'white', 'linewidth': 1}
    )
    plt.axis('equal')  # Equal aspect ratio ensures that pie is drawn as a circle
    
    # Add title
    plt.title('Distribution of Deity Categories in Orphic Hymns', fontsize=16, pad=20)
    
    # Save or display
    if output_file:
        plt.savefig(output_file, dpi=300, bbox_inches='tight')
        print(f"Saved category pie chart to {output_file}")
    else:
        plt.tight_layout()
        plt.show()
    plt.close()

def create_confidence_boxplot(classifications: List[Dict[str, Any]], output_file: str = None) -> None:
    """Create a boxplot of confidence scores by category"""
    # Extract data
    data = []
    for c in classifications:
        data.append({
            'category': c.get('category', 'Unknown'),
            'confidence': c.get('confidence', 0.0),
            'entity': c.get('entity', 'Unknown')
        })
    
    # Create dataframe
    df = pd.DataFrame(data)
    
    # Sort by median confidence
    category_order = df.groupby('category')['confidence'].median().sort_values(ascending=False).index
    
    # Create figure
    plt.figure(figsize=(12, 8))
    
    # Create boxplot
    sns.boxplot(x='category', y='confidence', data=df, order=category_order)
    
    # Add individual points
    sns.stripplot(
        x='category', 
        y='confidence', 
        data=df, 
        order=category_order,
        size=5, 
        color='black', 
        alpha=0.5,
        jitter=True
    )
    
    # Add labels and title
    plt.xlabel('Deity Category', fontsize=12)
    plt.ylabel('Confidence Score', fontsize=12)
    plt.title('Confidence Scores by Deity Category', fontsize=16)
    plt.xticks(rotation=45, ha='right')
    plt.grid(axis='y', linestyle='--', alpha=0.7)
    
    # Save or display
    if output_file:
        plt.savefig(output_file, dpi=300, bbox_inches='tight')
        print(f"Saved confidence boxplot to {output_file}")
    else:
        plt.tight_layout()
        plt.show()
    plt.close()

def create_attribute_word_cloud(classifications: List[Dict[str, Any]], output_file: str = None) -> None:
    """Create a word cloud of deity attributes"""
    try:
        from wordcloud import WordCloud
        
        # Extract attributes
        all_attributes = []
        for c in classifications:
            all_attributes.extend(c.get('attributes', []))
        
        # Create attribute text
        attribute_text = ' '.join(all_attributes)
        
        # Create word cloud
        wordcloud = WordCloud(
            width=800, 
            height=400, 
            background_color='white',
            colormap='viridis',
            contour_width=1,
            contour_color='steelblue',
            max_words=100
        ).generate(attribute_text)
        
        # Create figure
        plt.figure(figsize=(12, 8))
        
        # Plot word cloud
        plt.imshow(wordcloud, interpolation='bilinear')
        plt.axis("off")
        plt.title('Common Attributes of Deities in Orphic Hymns', fontsize=16, pad=20)
        
        # Save or display
        if output_file:
            plt.savefig(output_file, dpi=300, bbox_inches='tight')
            print(f"Saved attribute word cloud to {output_file}")
        else:
            plt.tight_layout()
            plt.show()
        plt.close()
        
    except ImportError:
        print("WordCloud package not installed. Run 'pip install wordcloud' to enable this visualization.")

def create_entity_table(classifications: List[Dict[str, Any]], top_n: int = 20, output_file: str = None) -> None:
    """Create a table of top entities with their classifications"""
    # Extract data
    data = []
    for c in classifications:
        data.append({
            'Entity': c.get('entity', 'Unknown'),
            'Category': c.get('category', 'Unknown'),
            'Confidence': c.get('confidence', 0.0),
            'Attributes': ', '.join(c.get('attributes', [])[:3]),  # Show just top 3 attributes
            'Context': c.get('context', '')[:50] + '...' if len(c.get('context', '')) > 50 else c.get('context', ''),
            'Description': c.get('description', '')
        })
    
    # Create dataframe
    df = pd.DataFrame(data)
    
    # Sort by confidence
    df = df.sort_values('Confidence', ascending=False).head(top_n)
    
    # Format confidence as percentage
    df['Confidence'] = df['Confidence'].apply(lambda x: f"{x:.1%}")
    
    # Create figure
    plt.figure(figsize=(16, top_n * 0.6))  # Make figure wider to accommodate the context
    
    # Hide axes
    ax = plt.gca()
    ax.axis('off')
    
    # Create table
    table = plt.table(
        cellText=df.values,
        colLabels=df.columns,
        loc='center',
        cellLoc='left',
        colWidths=[0.12, 0.12, 0.08, 0.15, 0.25, 0.28]  # Adjusted column widths
    )
    
    # Style table
    table.auto_set_font_size(False)
    table.set_fontsize(9)  # Slightly smaller font to fit more text
    table.scale(1, 1.5)
    
    # Add title
    plt.title(f'Top {top_n} Entities by Classification Confidence', fontsize=16, pad=20)
    
    # Save or display
    if output_file:
        plt.savefig(output_file, dpi=300, bbox_inches='tight')
        print(f"Saved entity table to {output_file}")
    else:
        plt.tight_layout()
        plt.show()
    plt.close()

def export_csv(classifications: List[Dict[str, Any]], output_file: str) -> None:
    """Export classifications to CSV for easier viewing"""
    # Extract data
    data = []
    for c in classifications:
        data.append({
            'Entity': c.get('entity', 'Unknown'),
            'Category': c.get('category', 'Unknown'),
            'Confidence': c.get('confidence', 0.0),
            'Description': c.get('description', ''),
            'Attributes': ', '.join(c.get('attributes', [])),
            'Context': c.get('context', '')
        })
    
    # Create dataframe
    df = pd.DataFrame(data)
    
    # Sort by confidence
    df = df.sort_values('Confidence', ascending=False)
    
    # Save to CSV
    df.to_csv(output_file, index=False)
    print(f"Exported {len(df)} classifications to {output_file}")

def create_visualizations(input_file: str, output_dir: str = None, show: bool = False) -> None:
    """Create all visualizations from classifications"""
    # Load classifications
    classifications = load_classifications(input_file)
    
    if not classifications:
        return
    
    # Create output directory if needed
    if output_dir:
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
    
    # Generate visualizations
    if show:
        # Display visualizations
        create_category_pie_chart(classifications)
        create_confidence_boxplot(classifications)
        create_attribute_word_cloud(classifications)
        create_entity_table(classifications)
    else:
        # Save visualizations
        if output_dir:
            create_category_pie_chart(
                classifications, 
                output_file=str(output_path / "category_distribution.png")
            )
            create_confidence_boxplot(
                classifications, 
                output_file=str(output_path / "confidence_by_category.png")
            )
            create_attribute_word_cloud(
                classifications, 
                output_file=str(output_path / "attribute_word_cloud.png")
            )
            create_entity_table(
                classifications, 
                output_file=str(output_path / "top_entities.png")
            )
            
            # Export to CSV for easier viewing
            export_csv(
                classifications,
                output_file=str(output_path / "deity_classifications.csv")
            )

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="Visualize deity classifications")
    
    parser.add_argument("--input", type=str, default=str(DEFAULT_INPUT),
                        help="Input classification JSON file")
    parser.add_argument("--output-dir", type=str, default=None,
                        help="Directory to save visualizations")
    parser.add_argument("--show", action="store_true",
                        help="Display visualizations instead of saving")
    parser.add_argument("--csv", type=str, help="Export results to CSV file")
    
    args = parser.parse_args()
    
    # Load classifications for CSV export
    if args.csv:
        classifications = load_classifications(args.input)
        if classifications:
            export_csv(classifications, args.csv)
    else:
        create_visualizations(args.input, args.output_dir, args.show)

if __name__ == "__main__":
    main() 