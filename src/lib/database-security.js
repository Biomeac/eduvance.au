// src/lib/database-security.js
// Database security utilities and Row Level Security policies

import { createServerSupabaseClient } from '@/utils/supabase/server';

// Database security policies for Row Level Security (RLS)
export const RLS_POLICIES = {
  // Staff users table policies
  staff_users: {
    // Only staff can view staff users
    select: `
      CREATE POLICY "Staff can view staff users" ON staff_users
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM staff_users 
          WHERE id = auth.uid()
        )
      );
    `,
    // Only admins can insert staff users
    insert: `
      CREATE POLICY "Admins can insert staff users" ON staff_users
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM staff_users 
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
    `,
    // Only admins can update staff users
    update: `
      CREATE POLICY "Admins can update staff users" ON staff_users
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM staff_users 
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
    `,
    // Only admins can delete staff users
    delete: `
      CREATE POLICY "Admins can delete staff users" ON staff_users
      FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM staff_users 
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
    `
  },

  // Community resource requests policies
  community_resource_requests: {
    // Anyone can view approved resources
    select: `
      CREATE POLICY "Anyone can view approved resources" ON community_resource_requests
      FOR SELECT USING (is_approved = true);
    `,
    // Staff can view all resources
    select_staff: `
      CREATE POLICY "Staff can view all resources" ON community_resource_requests
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM staff_users 
          WHERE id = auth.uid()
        )
      );
    `,
    // Authenticated users can insert resources
    insert: `
      CREATE POLICY "Authenticated users can insert resources" ON community_resource_requests
      FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
    `,
    // Only staff can update resources
    update: `
      CREATE POLICY "Staff can update resources" ON community_resource_requests
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM staff_users 
          WHERE id = auth.uid()
        )
      );
    `,
    // Only staff can delete resources
    delete: `
      CREATE POLICY "Staff can delete resources" ON community_resource_requests
      FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM staff_users 
          WHERE id = auth.uid()
        )
      );
    `
  },

  // Subjects table policies
  subjects: {
    // Anyone can view subjects
    select: `
      CREATE POLICY "Anyone can view subjects" ON subjects
      FOR SELECT USING (true);
    `,
    // Only staff can modify subjects
    insert: `
      CREATE POLICY "Staff can insert subjects" ON subjects
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM staff_users 
          WHERE id = auth.uid()
        )
      );
    `,
    update: `
      CREATE POLICY "Staff can update subjects" ON subjects
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM staff_users 
          WHERE id = auth.uid()
        )
      );
    `,
    delete: `
      CREATE POLICY "Staff can delete subjects" ON subjects
      FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM staff_users 
          WHERE id = auth.uid()
        )
      );
    `
  },

  // Exam sessions table policies
  exam_sessions: {
    // Anyone can view exam sessions
    select: `
      CREATE POLICY "Anyone can view exam sessions" ON exam_sessions
      FOR SELECT USING (true);
    `,
    // Only staff can modify exam sessions
    insert: `
      CREATE POLICY "Staff can insert exam sessions" ON exam_sessions
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM staff_users 
          WHERE id = auth.uid()
        )
      );
    `,
    update: `
      CREATE POLICY "Staff can update exam sessions" ON exam_sessions
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM staff_users 
          WHERE id = auth.uid()
        )
      );
    `,
    delete: `
      CREATE POLICY "Staff can delete exam sessions" ON exam_sessions
      FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM staff_users 
          WHERE id = auth.uid()
        )
      );
    `
  }
};

// Secure database query wrapper
export class SecureDatabase {
  constructor() {
    this.supabase = createServerSupabaseClient();
  }

  // Get current user with role
  async getCurrentUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser();
    
    if (error || !user) {
      return { user: null, role: null, error };
    }

    const { data: staffData, error: staffError } = await this.supabase
      .from('staff_users')
      .select('role')
      .eq('id', user.id)
      .single();

    return {
      user,
      role: staffData?.role || null,
      error: staffError
    };
  }

  // Secure select query
  async secureSelect(table, options = {}) {
    const { user, role, error } = await this.getCurrentUser();
    
    if (error) {
      throw new Error('Authentication failed');
    }

    const { select = '*', filters = {}, orderBy = null, limit = null } = options;
    
    let query = this.supabase.from(table).select(select);
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    // Apply ordering
    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending });
    }
    
    // Apply limit
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error: queryError } = await query;
    
    if (queryError) {
      throw new Error(`Database query failed: ${queryError.message}`);
    }

    return data;
  }

  // Secure insert query
  async secureInsert(table, data, options = {}) {
    const { user, role, error } = await this.getCurrentUser();
    
    if (error) {
      throw new Error('Authentication failed');
    }

    const { requiredRole = 'staff' } = options;
    
    // Check role permissions
    if (requiredRole === 'admin' && role !== 'admin') {
      throw new Error('Insufficient permissions');
    }

    if (requiredRole === 'staff' && !['admin', 'moderator', 'staff'].includes(role)) {
      throw new Error('Staff access required');
    }

    // Add audit fields
    const secureData = {
      ...data,
      created_by: user.id,
      created_at: new Date().toISOString()
    };

    const { data: result, error: insertError } = await this.supabase
      .from(table)
      .insert(secureData)
      .select();

    if (insertError) {
      throw new Error(`Database insert failed: ${insertError.message}`);
    }

    return result;
  }

  // Secure update query
  async secureUpdate(table, id, data, options = {}) {
    const { user, role, error } = await this.getCurrentUser();
    
    if (error) {
      throw new Error('Authentication failed');
    }

    const { requiredRole = 'staff' } = options;
    
    // Check role permissions
    if (requiredRole === 'admin' && role !== 'admin') {
      throw new Error('Insufficient permissions');
    }

    if (requiredRole === 'staff' && !['admin', 'moderator', 'staff'].includes(role)) {
      throw new Error('Staff access required');
    }

    // Add audit fields
    const secureData = {
      ...data,
      updated_by: user.id,
      updated_at: new Date().toISOString()
    };

    const { data: result, error: updateError } = await this.supabase
      .from(table)
      .update(secureData)
      .eq('id', id)
      .select();

    if (updateError) {
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    return result;
  }

  // Secure delete query
  async secureDelete(table, id, options = {}) {
    const { user, role, error } = await this.getCurrentUser();
    
    if (error) {
      throw new Error('Authentication failed');
    }

    const { requiredRole = 'staff' } = options;
    
    // Check role permissions
    if (requiredRole === 'admin' && role !== 'admin') {
      throw new Error('Insufficient permissions');
    }

    if (requiredRole === 'staff' && !['admin', 'moderator', 'staff'].includes(role)) {
      throw new Error('Staff access required');
    }

    const { error: deleteError } = await this.supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw new Error(`Database delete failed: ${deleteError.message}`);
    }

    return true;
  }

  // Audit log entry
  async logAudit(action, table, recordId, details = {}) {
    const { user, role } = await this.getCurrentUser();
    
    if (!user) return;

    const auditData = {
      action,
      table_name: table,
      record_id: recordId,
      user_id: user.id,
      user_role: role,
      details: JSON.stringify(details),
      timestamp: new Date().toISOString(),
      ip_address: details.ip || 'unknown'
    };

    await this.supabase
      .from('audit_logs')
      .insert(auditData);
  }
}

// SQL injection prevention
export function sanitizeSQLInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[';\\]/g, '') // Remove SQL injection characters
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove SQL block comments
    .replace(/\*\//g, '')
    .trim();
}

// Input validation for database queries
export function validateDatabaseInput(data, schema) {
  const errors = [];
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }
    
    if (value !== undefined && value !== null) {
      if (rules.type && typeof value !== rules.type) {
        errors.push(`${field} must be a ${rules.type}`);
        continue;
      }
      
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${field} must be no more than ${rules.maxLength} characters`);
        continue;
      }
      
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(`${field} format is invalid`);
        continue;
      }
    }
  }
  
  return errors;
}

// Database field schemas
export const DATABASE_SCHEMAS = {
  staff_users: {
    username: { type: 'string', maxLength: 50, pattern: /^[a-zA-Z0-9_-]+$/ },
    email: { type: 'string', maxLength: 255, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    role: { type: 'string', enum: ['admin', 'moderator', 'staff'] }
  },
  community_resource_requests: {
    title: { type: 'string', maxLength: 200, required: true },
    description: { type: 'string', maxLength: 1000 },
    link: { type: 'string', maxLength: 500, pattern: /^https?:\/\/.+/ },
    unit_chapter_name: { type: 'string', maxLength: 100 }
  },
  subjects: {
    name: { type: 'string', maxLength: 100, required: true },
    code: { type: 'string', maxLength: 20 },
    syllabus_type: { type: 'string', enum: ['IAL', 'IGCSE'] }
  }
};

// Export secure database instance
export const secureDB = new SecureDatabase();
