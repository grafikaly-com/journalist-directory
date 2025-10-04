import { ReactElement, createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext({ isEditor: false });

export const AuthProvider = ({ children }: { children: ReactElement }) => {
  const [isEditor, setIsEditor] = useState(false);

  useEffect(() => {
    setIsEditor(localStorage?.getItem('editor') === 'true');
  }, []);

  return <AuthContext.Provider value={{ isEditor }}>{children}</AuthContext.Provider>;
};

export const usePermissions = () => {
  const { isEditor } = useContext(AuthContext);
  return { isEditor };
};
