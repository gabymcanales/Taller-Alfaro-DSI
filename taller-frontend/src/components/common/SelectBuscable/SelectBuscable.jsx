import { useState, useRef, useEffect } from 'react';
import './SelectBuscable.css';

// Ignora mayúsculas y tildes al comparar ("aceite" encuentra "Aceíte")
const normalizar = (texto) =>
    String(texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const SelectBuscable = ({
    options,
    value,
    onChange,
    placeholder = '— Seleccionar —',
    disabled = false,
    className = '',
    style
}) => {
    const [abierto, setAbierto] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [resaltado, setResaltado] = useState(0);
    const contenedorRef = useRef(null);
    const listaRef = useRef(null);
    const inputRef = useRef(null);

    const seleccionada = options.find(o => String(o.value) === String(value ?? ''));
    const filtradas = options.filter(o => normalizar(o.label).includes(normalizar(busqueda)));

    useEffect(() => {
        const handleClickFuera = (e) => {
            if (contenedorRef.current && !contenedorRef.current.contains(e.target)) {
                setAbierto(false);
                setBusqueda('');
            }
        };
        document.addEventListener('mousedown', handleClickFuera);
        return () => document.removeEventListener('mousedown', handleClickFuera);
    }, []);

    useEffect(() => {
        const item = listaRef.current?.children[resaltado];
        item?.scrollIntoView({ block: 'nearest' });
    }, [resaltado]);

    const abrir = () => {
        if (disabled) return;
        setAbierto(true);
        setBusqueda('');
        setResaltado(0);
    };

    const cerrar = () => {
        setAbierto(false);
        setBusqueda('');
    };

    const seleccionar = (opcion) => {
        onChange(String(opcion.value));
        cerrar();
        inputRef.current?.blur();
    };

    const handleKeyDown = (e) => {
        if (!abierto && (e.key === 'ArrowDown' || e.key === 'Enter')) {
            e.preventDefault();
            abrir();
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setResaltado(i => Math.min(i + 1, filtradas.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setResaltado(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filtradas[resaltado]) seleccionar(filtradas[resaltado]);
        } else if (e.key === 'Escape') {
            cerrar();
        } else if (e.key === 'Tab') {
            cerrar();
        }
    };

    return (
        <div
            className={`select-buscable ${disabled ? 'deshabilitado' : ''}`}
            style={style}
            ref={contenedorRef}
        >
            <input
                ref={inputRef}
                type="text"
                className={`select-buscable-input ${className}`}
                value={abierto ? busqueda : (seleccionada?.label ?? '')}
                placeholder={abierto && seleccionada ? seleccionada.label : placeholder}
                onChange={(e) => {
                    setBusqueda(e.target.value);
                    setResaltado(0);
                    if (!abierto) setAbierto(true);
                }}
                onFocus={abrir}
                onClick={() => { if (!abierto) abrir(); }}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                autoComplete="off"
            />
            <span className={`select-buscable-flecha ${abierto ? 'abierto' : ''}`}>▾</span>

            {abierto && (
                <ul className="select-buscable-lista" ref={listaRef}>
                    {filtradas.length === 0 ? (
                        <li className="select-buscable-vacio">Sin resultados</li>
                    ) : filtradas.map((o, i) => (
                        <li
                            key={o.value}
                            className={`select-buscable-opcion
                                ${i === resaltado ? 'resaltada' : ''}
                                ${String(o.value) === String(value ?? '') ? 'seleccionada' : ''}`}
                            onMouseDown={(e) => { e.preventDefault(); seleccionar(o); }}
                            onMouseEnter={() => setResaltado(i)}
                        >
                            {o.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SelectBuscable;
