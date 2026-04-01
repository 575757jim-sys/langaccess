export function generateBatchCode(city: string): string {
  const cleanCity = city.toLowerCase().replace(/[^a-z0-9]/g, '');
  const date = new Date();
  const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, '');
  const shortId = Math.random().toString(36).substring(2, 8);

  return `${cleanCity}-${yyyymmdd}-${shortId}`;
}

export function generateBatchQRUrl(batchCode: string): string {
  return `https://langaccess.org/help?batch=${encodeURIComponent(batchCode)}`;
}

export interface BatchValidation {
  valid: boolean;
  errors: string[];
}

export function validateBatchData(data: {
  batch_code?: string;
  qr_url?: string;
  qr_image_path?: string;
  card_asset_path?: string;
}): BatchValidation {
  const errors: string[] = [];

  if (!data.batch_code) {
    errors.push('batch_code is missing');
  }

  if (!data.qr_url) {
    errors.push('qr_url is missing');
  } else if (!data.qr_url.includes('?batch=')) {
    errors.push('qr_url does not contain ?batch= parameter');
  }

  if (!data.qr_image_path) {
    errors.push('qr_image_path is missing');
  }

  if (!data.card_asset_path) {
    errors.push('card_asset_path is missing');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
