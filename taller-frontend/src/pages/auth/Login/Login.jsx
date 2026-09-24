import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axiosInstance from '../../../api/axiosInstance';
import './Login.css';

const leerMensajeSesion = () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('sesion') === 'expirada') {
        window.history.replaceState({}, '', '/login');
        return 'Tu sesión finalizó. Iniciá sesión de nuevo.';
    }
    return '';
};

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [error, setError] = useState('');
    const [mensajeSesion, setMensajeSesion] = useState(leerMensajeSesion);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMensajeSesion('');

        try {
            const response = await axiosInstance.post('/auth/login', {
                username: username.trim(),
                password: password.trim(),
            });
            const { token } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('username', username.trim());

            navigate('/');
        } catch (err) {
            console.error(err);
            setError('Usuario o contraseña incorrectos');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>Taller Alfaro</h1>
                <p>Sistema de Gestión</p>

                <form onSubmit={handleSubmit}>
                    {mensajeSesion && <div className="info">{mensajeSesion}</div>}

                    <div className="form-field">
                        <label>Usuario</label>
                        <input
                            type="text"
                            name="username"
                            autoComplete="username"
                            autoCapitalize="none"
                            autoCorrect="off"
                            spellCheck="false"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label>Contraseña</label>
                        <div className="password-field">
                            <input
                                type={mostrarPassword ? 'text' : 'password'}
                                name="password"
                                autoComplete="current-password"
                                autoCapitalize="none"
                                autoCorrect="off"
                                spellCheck="false"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <span
                                className="toggle-password"
                                onClick={() => setMostrarPassword(!mostrarPassword)}
                            >
                                {mostrarPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                    </div>

                    {error && <div className="error">{error}</div>}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Cargando...' : 'Iniciar Sesión'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;