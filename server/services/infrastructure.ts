export function validateInfrastructureConfig() 
{
  const required = process.env.REQUIRE_INFRASTRUCTURE === 'true' || process.env.NODE_ENV === 'production';
  if (!required) 
    return { required: false, missing: [] as string[] };

  const missing: string[] = [];
  if (!process.env.MYSQL_URL && !process.env.MYSQL_HOST) 
    missing.push('MYSQL_URL or MYSQL_HOST');
  if (!process.env.REDIS_URL) 
    missing.push('REDIS_URL');
  if (!process.env.KAFKA_BROKERS) 
    missing.push('KAFKA_BROKERS');
  if (missing.length) throw new Error(`Infrastructure configuration is required but missing: ${missing.join(', ')}`);
  return { required: true, missing };
}