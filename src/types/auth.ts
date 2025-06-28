export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isStaff: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  cookiesAccepted: boolean;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}