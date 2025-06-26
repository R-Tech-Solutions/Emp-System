import React from 'react';
import { getUserData, hasPermission } from '../utils/auth';

const PermissionDebug = () => {
  const userData = getUserData();

  if (!userData) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-400 rounded-md">
        <h3 className="font-bold text-yellow-800">Debug: No User Data</h3>
        <p className="text-yellow-700">User data not found in session storage.</p>
      </div>
    );
  }

  const permissions = userData.permissions || {};
  const permissionKeys = Object.keys(permissions);

  return (
    <div className="p-4 bg-blue-100 border border-blue-400 rounded-md mb-4">
      <h3 className="font-bold text-blue-800 mb-2">Debug: User Permissions</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-blue-700 mb-1">User Info:</h4>
          <p className="text-sm text-blue-600">Name: {userData.name}</p>
          <p className="text-sm text-blue-600">Email: {userData.email}</p>
          <p className="text-sm text-blue-600">Role: <span className="font-semibold">{userData.role}</span></p>
          <p className="text-sm text-blue-600">Status: {userData.status}</p>
        </div>
        
        <div>
          <h4 className="font-semibold text-blue-700 mb-1">Permissions ({permissionKeys.length}):</h4>
          {permissionKeys.length > 0 ? (
            <div className="text-sm">
              {permissionKeys.map(permission => (
                <div key={permission} className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${permissions[permission] ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className="text-blue-600">{permission}: {permissions[permission] ? '✅' : '❌'}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-blue-600">No permissions set</p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <h4 className="font-semibold text-blue-700 mb-1">Permission Tests:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          {['employees', 'tasks', 'user', 'crm', 'products', 'invoice', 'payroll', 'attendance'].map(permission => (
            <div key={permission} className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${hasPermission(permission) ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-blue-600">{permission}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PermissionDebug; 