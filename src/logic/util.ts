const cLog = (msg: string, type?: 'error' | 'warning') => {
  const tagStyle = `background-color:${
    type === 'error' ? '#991e2a' : type === 'warning' ? '#612a17' : '#253254'
  }; color:white; font-weight: bold; padding: 4px; border-radius: 2px`;
  console.log(`%ccc-gen ${type}`, tagStyle, msg);
};

export { cLog };
