#!/usr/bin/env python3
"""
Generate Structural Landscapes images for the Renergence website.
Governed by GOV-07 — Visual Identity & Image Governance.

Usage: python3 generate-site-images.py
"""

import base64
import io
import sys
from pathlib import Path

# Load marketing env (has OPENAI_API_KEY)
sys.path.insert(0, str(Path.home() / "Projects" / "marketing" / "scripts"))
from _env import load_marketing_env
load_marketing_env()

from openai import OpenAI
from PIL import Image

OUTPUT_DIR = Path(__file__).parent / "site" / "images"
OUTPUT_DIR.mkdir(exist_ok=True)

# GOV-07 prompt template
PROMPT_TEMPLATE = """{subject}. Shot in {lighting}.
Photographic realism with painterly softness. Muted earth tones with subtle presence of {color_desc}.
No people, no faces, no text, no logos. Museum-quality composition.
Quiet, spacious, grounded. Could be mistaken for a fine art photograph."""

# Thread-specific image definitions per GOV-07
IMAGES = [
    {
        "filename": "ren-renergence-recognition-v1.jpg",
        "thread": "Renergence",
        "subject": "A weathered coastal cliff face where layers of sedimentary rock are exposed by tidal erosion, revealing strata of different geological ages. Shallow water pools reflect overcast sky at the base",
        "lighting": "soft overcast light with muted silvery tones",
        "color_desc": "deep navy blue in the shadows between rock layers and in the reflected sky",
    },
    {
        "filename": "ren-structure-recognition-v1.jpg",
        "thread": "Structure",
        "subject": "An old stone bridge with exposed load-bearing arches, partially overgrown. The engineering structure is clearly visible — buttresses, keystone, weight distribution paths. A narrow river passes beneath",
        "lighting": "late afternoon diffused light through thin clouds",
        "color_desc": "deep maroon-purple in the shadow tones of the stonework",
    },
    {
        "filename": "ren-alignment-recognition-v1.jpg",
        "thread": "Alignment",
        "subject": "A close-up of the end grain of a large timber log, showing the natural growth rings and grain pattern. The wood is weathered and sits in a timber yard or workshop, surrounded by other wood",
        "lighting": "warm natural light from a nearby window or doorway",
        "color_desc": "warm amber-orange in the wood grain and natural patina of the timber",
    },
    {
        "filename": "ren-positioning-recognition-v1.jpg",
        "thread": "Positioning",
        "subject": "A concrete observation platform or lookout point extending over a wide valley landscape. The platform has a simple metal railing. The view stretches to distant hills and a winding river below",
        "lighting": "early morning mist with cool diffused light",
        "color_desc": "subtle rose-pink in the distant horizon and mist where dawn color remains",
    },
    {
        "filename": "ren-renergence-about-v1.jpg",
        "thread": "Renergence",
        "subject": "A wide view of a rocky shoreline at low tide, exposing layers of flat sedimentary rock extending into calm water. Tide pools dot the surface. The horizon line is low and clean",
        "lighting": "golden hour approaching, but muted by high thin clouds",
        "color_desc": "deep navy blue in the water and wet rock reflections",
    },
]


def generate_image(image_def: dict) -> Path | None:
    """Generate a single Structural Landscape image."""
    client = OpenAI()

    prompt = PROMPT_TEMPLATE.format(
        subject=image_def["subject"],
        lighting=image_def["lighting"],
        color_desc=image_def["color_desc"],
    )

    output_path = OUTPUT_DIR / image_def["filename"]
    print(f"\nGenerating: {image_def['filename']} ({image_def['thread']})")
    print(f"  Prompt: {prompt[:120]}...")

    try:
        response = client.images.generate(
            model="gpt-image-1",
            prompt=prompt,
            n=1,
            size="1536x1024",
            quality="high",
        )
        b64_data = response.data[0].b64_json
        if b64_data:
            image_bytes = base64.b64decode(b64_data)
            img = Image.open(io.BytesIO(image_bytes))
            img = img.convert("RGB")
            # Save at 85% quality for web optimization (GOV-07 spec)
            img.save(str(output_path), "JPEG", quality=85)
            size_kb = output_path.stat().st_size / 1024
            print(f"  ✓ Saved: {output_path.name} ({size_kb:.0f} KB)")
            return output_path
    except Exception as e:
        print(f"  ✗ ERROR: {e}")
        return None

    return None


def create_og_crop(source_path: Path) -> Path | None:
    """Crop a 1536x1024 image to 1200x630 for OG."""
    output_path = OUTPUT_DIR / "og-default.jpg"
    try:
        img = Image.open(source_path)
        w, h = img.size
        # Center crop to 1200x630 aspect ratio (1.905:1) from 1536x1024 (1.5:1)
        target_ratio = 1200 / 630
        current_ratio = w / h
        if current_ratio < target_ratio:
            # Image is taller than target — crop height
            new_h = int(w / target_ratio)
            top = (h - new_h) // 2
            img = img.crop((0, top, w, top + new_h))
        else:
            # Image is wider than target — crop width
            new_w = int(h * target_ratio)
            left = (w - new_w) // 2
            img = img.crop((left, 0, left + new_w, h))

        img = img.resize((1200, 630), Image.LANCZOS)
        img.save(str(output_path), "JPEG", quality=88)
        size_kb = output_path.stat().st_size / 1024
        print(f"\n  ✓ OG crop: {output_path.name} ({size_kb:.0f} KB)")
        return output_path
    except Exception as e:
        print(f"  ✗ OG crop ERROR: {e}")
        return None


def main():
    print("=" * 60)
    print("Renergence Structural Landscapes — Image Generation")
    print("Governed by GOV-07 Visual Identity")
    print("=" * 60)

    results = []
    for image_def in IMAGES:
        result = generate_image(image_def)
        results.append((image_def["filename"], result))

    # Create OG crop from the about image
    about_path = OUTPUT_DIR / "ren-renergence-about-v1.jpg"
    if about_path.exists():
        print("\nCreating OG default crop from about image...")
        og_result = create_og_crop(about_path)
        results.append(("og-default.jpg", og_result))

    print("\n" + "=" * 60)
    print("RESULTS:")
    for filename, result in results:
        status = "✓" if result else "✗"
        print(f"  {status} {filename}")

    success = sum(1 for _, r in results if r)
    total = len(results)
    print(f"\n{success}/{total} images generated successfully.")
    print("=" * 60)
    print("\nNext: Review each image against GOV-07 pass/fail checklist.")


if __name__ == "__main__":
    main()
