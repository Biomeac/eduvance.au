# Row Level Security (RLS) Policies

## Required Supabase RLS Policies

### 1. Staff Users Table
```sql
-- Enable RLS on staff_users table
ALTER TABLE staff_users ENABLE ROW LEVEL SECURITY;

-- Only staff users can read their own data
CREATE POLICY "Staff can read own data" ON staff_users
  FOR SELECT USING (auth.uid() = id);

-- Only service role can insert/update staff users
CREATE POLICY "Service role can manage staff" ON staff_users
  FOR ALL USING (auth.role() = 'service_role');
```

### 2. Resources Table
```sql
-- Enable RLS on resources table
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Public read access for approved resources
CREATE POLICY "Public can read approved resources" ON resources
  FOR SELECT USING (approved = 'Approved');

-- Staff can read all resources
CREATE POLICY "Staff can read all resources" ON resources
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM staff_users 
      WHERE staff_users.id = auth.uid()
    )
  );

-- Staff can insert resources
CREATE POLICY "Staff can insert resources" ON resources
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff_users 
      WHERE staff_users.id = auth.uid()
    )
  );

-- Staff can update resources
CREATE POLICY "Staff can update resources" ON resources
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM staff_users 
      WHERE staff_users.id = auth.uid()
    )
  );
```

### 3. Community Resource Requests Table
```sql
-- Enable RLS on community_resource_requests table
ALTER TABLE community_resource_requests ENABLE ROW LEVEL SECURITY;

-- Public can insert requests
CREATE POLICY "Public can insert requests" ON community_resource_requests
  FOR INSERT WITH CHECK (true);

-- Staff can read all requests
CREATE POLICY "Staff can read all requests" ON community_resource_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM staff_users 
      WHERE staff_users.id = auth.uid()
    )
  );

-- Staff can update requests
CREATE POLICY "Staff can update requests" ON community_resource_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM staff_users 
      WHERE staff_users.id = auth.uid()
    )
  );
```

### 4. Papers Table
```sql
-- Enable RLS on papers table
ALTER TABLE papers ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can read papers" ON papers
  FOR SELECT USING (true);

-- Staff can insert papers
CREATE POLICY "Staff can insert papers" ON papers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff_users 
      WHERE staff_users.id = auth.uid()
    )
  );

-- Staff can update papers
CREATE POLICY "Staff can update papers" ON papers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM staff_users 
      WHERE staff_users.id = auth.uid()
    )
  );
```

### 5. Subjects Table
```sql
-- Enable RLS on subjects table
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can read subjects" ON subjects
  FOR SELECT USING (true);

-- Only service role can manage subjects
CREATE POLICY "Service role can manage subjects" ON subjects
  FOR ALL USING (auth.role() = 'service_role');
```

### 6. Exam Sessions Table
```sql
-- Enable RLS on exam_sessions table
ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can read exam sessions" ON exam_sessions
  FOR SELECT USING (true);

-- Only service role can manage exam sessions
CREATE POLICY "Service role can manage exam sessions" ON exam_sessions
  FOR ALL USING (auth.role() = 'service_role');
```

## Implementation Steps

1. **Connect to Supabase Dashboard**
2. **Go to SQL Editor**
3. **Run each policy block above**
4. **Test policies with different user roles**
5. **Verify that public users can only read approved content**
6. **Verify that staff users can manage all content**

## Security Benefits

- **Data Isolation**: Users can only access data they're authorized to see
- **Role-based Access**: Different permissions for staff vs public users
- **Database-level Security**: Policies enforced at the database level
- **Prevents Direct Access**: Even if someone bypasses the API, RLS prevents unauthorized access
