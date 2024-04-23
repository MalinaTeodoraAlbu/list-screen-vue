const verifyAndCheckAdmin = async (idToken) => {
    try {
      const response = await fetch('http://localhost:4000/verify-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`, 
        },
      });
  
      console.log(response);
  
      if (response.ok) {
        const result = await response.json();
        return result.isAdmin;
      } else {
        console.error('Error verifying admin status:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Error verifying admin status:', error);
      return false;
    }
  };

  export default verifyAndCheckAdmin;
  