-- Add notes column to candidates table
alter table candidates add column if not exists notes text default '';
