import { type FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginInputSchema, registerInputSchema } from '@gamestation/shared';
import { ApiError } from '../../api/client';
import { authApi } from '../../api/endpoints';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { TextField } from '../../components/ui/Field';
import { useAuthStore } from '../../lib/authStore';

interface Props {
  mode: 'login' | 'register';
}

interface FieldErrors {
  email?: string;
  password?: string;
}

export function AuthPage({ mode }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((state) => state.setSession);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === 'register';
  const schema = isRegister ? registerInputSchema : loginInputSchema;
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/';

  const submit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setFormError(null);

    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === 'email' || key === 'password') next[key] ??= issue.message;
      }
      setFieldErrors(next);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      const result = isRegister
        ? await authApi.register(parsed.data)
        : await authApi.login(parsed.data);
      setSession(result.token, result.user);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setFormError(
        error instanceof ApiError ? error.message : 'Не удалось выполнить вход, попробуйте позже',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 460, marginInline: 'auto' }}>
      <h1>{isRegister ? 'Регистрация' : 'Вход'}</h1>
      <Card>
        <form className="stack" onSubmit={submit} noValidate>
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={fieldErrors.email}
          />
          <TextField
            label="Пароль"
            type="password"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={fieldErrors.password}
            hint={isRegister ? 'Не короче 8 символов' : undefined}
          />
          {formError && (
            <p role="alert" style={{ color: 'var(--danger)' }}>
              {formError}
            </p>
          )}
          <Button type="submit" variant="primary" block loading={submitting}>
            {isRegister ? 'Создать аккаунт' : 'Войти'}
          </Button>
        </form>
      </Card>
      <p className="muted">
        {isRegister ? (
          <>
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </>
        ) : (
          <>
            Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
          </>
        )}
      </p>
    </div>
  );
}
