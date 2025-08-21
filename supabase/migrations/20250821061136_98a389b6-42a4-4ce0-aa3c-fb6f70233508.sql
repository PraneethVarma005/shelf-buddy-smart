
-- Create a function to execute dynamic SQL (needed for cron scheduling)
CREATE OR REPLACE FUNCTION execute_sql(query text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query;
  RETURN 'SQL executed successfully';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Error: ' || SQLERRM;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION execute_sql(text) TO authenticated;
