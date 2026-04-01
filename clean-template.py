#!/usr/bin/env python3
from PIL import Image

input_path = '/tmp/cc-agent/65206495/project/public/templates/langaccess_master_noqr_v1_fixed.png'
output_path = '/tmp/cc-agent/65206495/project/public/templates/langaccess_master_clean.png'

print(f'Reading template: {input_path}')
img = Image.open(input_path)
print(f'Template size: {img.size}')
print(f'Template mode: {img.mode}')

print(f'Saving clean PNG to: {output_path}')
img.save(output_path, 'PNG', optimize=False)
print('✓ Clean template saved successfully')
