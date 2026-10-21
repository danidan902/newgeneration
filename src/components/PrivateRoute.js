// // import React from 'react';
// // import { Navigate } from 'react-router-dom';

// // const PrivateRoute = ({ children, role }) => {
// //   const token = localStorage.getItem('token');
// //   const userRole = localStorage.getItem('role');
  
// //   if (!token) {
// //     return <Navigate to="/login" />;
// //   }
  
// //   if (role && userRole !== role) {
// //     return <Navigate to="/login" />;
// //   }
  
// //   return children;
// // };

// // export default PrivateRoute;


// import React from 'react';
// import { Navigate } from 'react-router-dom';

// const PrivateRoute = ({ children, role }) => {
//   const token = localStorage.getItem('token');
//   const userRole = localStorage.getItem('role');

//   // ❌ not logged in
//   if (!token) {
//     return <Navigate to="/login" replace />;
//   }

//   // ❌ wrong role
//   if (role && userRole?.toLowerCase() !== role.toLowerCase()) {
//     return <Navigate to="/login" replace />;
//   }

//   // ✅ allowed
//   return children;
// };

// export default PrivateRoute;


import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  // ❌ not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (role) {
    // Special case: admin route allows both admin and superadmin
    if (role.toLowerCase() === 'admin') {
      if (userRole?.toLowerCase() === 'admin' || userRole?.toLowerCase() === 'superadmin') {
        return children; // ✅ allowed
      }
      return <Navigate to="/login" replace />; // ❌ wrong role
    }
    
    // For other roles (teacher, student), check exact match
    if (userRole?.toLowerCase() !== role.toLowerCase()) {
      return <Navigate to="/login" replace />;
    }
  }

  // ✅ allowed
  return children;
};

export default PrivateRoute;