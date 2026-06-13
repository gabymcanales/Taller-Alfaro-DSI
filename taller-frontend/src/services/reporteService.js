import axiosInstance from '../api/axiosInstance';

export const getReporteDiario = (fecha) =>
    axiosInstance.get(`/reportes/diario?fecha=${fecha}`);

export const getReporteMensual = (mes, anio) =>
    axiosInstance.get(`/reportes/mensual?mes=${mes}&anio=${anio}`);

export const getRankingServicios = (fechaInicio, fechaFin, area = '') =>
    axiosInstance.get(`/reportes/ranking?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&area=${area}`);

export const exportarReporteDiarioPdf = (fecha) =>
    axiosInstance.get(`/reportes/diario/pdf?fecha=${fecha}`, { responseType: 'blob' });

export const exportarReporteMensualPdf = (mes, anio) =>
    axiosInstance.get(`/reportes/mensual/pdf?mes=${mes}&anio=${anio}`, { responseType: 'blob' });

export const exportarRankingPdf = (fechaInicio, fechaFin, area = '') =>
    axiosInstance.get(`/reportes/ranking/pdf?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&area=${area}`, { responseType: 'blob' });