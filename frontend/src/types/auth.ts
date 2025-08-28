export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'leader' | 'member';
  avatar?: string;
  phone?: string;
  address?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  updateUser: (user: User) => void;
}

export interface ProfileUpdateData {
  name?: string;
  phone?: string;
  address?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
} 