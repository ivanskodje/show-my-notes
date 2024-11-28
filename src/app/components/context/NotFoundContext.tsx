import { createContext, useContext, useState } from "react";

const NotFoundContext = createContext({
  isNotFound: false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setIsNotFound: (value: boolean) => {},
});

export const NotFoundProvider = ({ children }: { children: React.ReactNode }) => {
  const [isNotFound, setIsNotFound] = useState(false);
  return (
    <NotFoundContext.Provider value={{ isNotFound, setIsNotFound }}>
      {children}
    </NotFoundContext.Provider>
  );
};

export const useNotFound = () => useContext(NotFoundContext);
