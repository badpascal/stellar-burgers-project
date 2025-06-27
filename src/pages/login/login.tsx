import { FC, SyntheticEvent, useEffect, useState } from 'react';
import { LoginUI } from '@ui-pages';
import { useDispatch, useSelector } from '../../services/store';
import {
  clearErrors,
  errorSelector,
  loginUserThunk
} from '../../services/slices/userSlice';
import { useNavigate, useLocation } from 'react-router-dom';

export const Login: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginAttempted, setLoginAttempted] = useState(false);

  const dispatch = useDispatch();
  const error = useSelector(errorSelector);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setLoginAttempted(true);
    try {
      await dispatch(loginUserThunk({ email, password })).unwrap();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Ошибка авторизации:', error);
    }
  };

  useEffect(() => {
    dispatch(clearErrors());
  }, []);

  return (
    <LoginUI
      errorText={loginAttempted ? error || 'Неверный email или пароль' : ''}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      handleSubmit={handleSubmit}
    />
  );
};
