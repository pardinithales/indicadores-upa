// src/components/Report.jsx

import React, { useRef, useState } from 'react';
import './Report.css'; // Importar o CSS para esconder o botão
import CabecalhoLogo1 from '../assets/cabecalho-final_logo.png';
import CabecalhoLogo2 from '../assets/logo2-cabecalho_final.png';
import html2pdf from 'html2pdf.js';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const Report = ({ data, metadata }) => {
  const reportRef = useRef();
  const [isExporting, setIsExporting] = useState(false);

  // Funções auxiliares para processar os dados

  // 1. Número de internações por hospital
  const getInternacoesPorHospital = () => {
    const counts = data.reduce((acc, curr) => {
      const hospital = curr.Hospital || 'NÃO INFORMADO';
      acc[hospital] = (acc[hospital] || 0) + 1;
      return acc;
    }, {});

    const result = Object.entries(counts).map(([hospital, count]) => ({
      hospital,
      count,
    }));

    result.sort((a, b) => b.count - a.count);

    return result;
  };

  // 2. Tipos de internação
  const getTiposDeInternacao = () => {
    const counts = data.reduce((acc, curr) => {
      const tipo = curr.Tipo || 'NÃO INFORMADO';
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {});

    const result = Object.entries(counts).map(([tipo, quantidade]) => ({
      tipo,
      quantidade,
    }));

    return result;
  };

  // 3. Tipo de alta
  const getTiposDeAlta = () => {
    const counts = data.reduce((acc, curr) => {
      const status = curr.Status || 'NÃO INFORMADO';
      if (status.toUpperCase().includes('ALTA VIA SAD')) {
        acc['ALTA VIA SAD'] = (acc['ALTA VIA SAD'] || 0) + 1;
      } else if (status.toUpperCase().includes('ALTA')) {
        acc['ALTA'] = (acc['ALTA'] || 0) + 1;
      }
      return acc;
    }, {});

    const result = Object.entries(counts).map(([tipo, quantidade]) => ({
      tipo,
      quantidade,
    }));

    return result;
  };

  // 4. Saídas (Óbitos, Evasão)
  const getSaidas = () => {
    const counts = data.reduce((acc, curr) => {
      const status = curr.Status || 'NÃO INFORMADO';
      if (status.toUpperCase().includes('ÓBITO')) {
        acc['ÓBITOS'] = (acc['ÓBITOS'] || 0) + 1;
      }
      if (status.toUpperCase().includes('EVASÃO')) {
        acc['EVASÃO'] = (acc['EVASÃO'] || 0) + 1;
      }
      return acc;
    }, {});

    const result = Object.entries(counts).map(([tipo, quantidade]) => ({
      tipo,
      quantidade,
    }));

    return result;
  };

  // 5. Clínicas atendidas
  const getClinicasAtendidas = () => {
    const counts = data.reduce((acc, curr) => {
      const setor = curr.Setor || 'NÃO INFORMADO';
      acc[setor] = (acc[setor] || 0) + 1;
      return acc;
    }, {});

    const result = Object.entries(counts).map(([clinica, quantidade]) => ({
      clinica,
      quantidade,
    }));

    result.sort((a, b) => b.quantidade - a.quantidade);

    return result;
  };

  // 6. Micro-regiões atendidas
  const getMicroRegioesAtendidas = () => {
    const municipiosAtendidos = [
      'DIVINÓPOLIS',
      'ARAUJOS',
      'CARMO DO CAJURU',
      'PERDIGAO',
      'SÃO GONÇALO DO PARÁ',
      'SÃO SEBASTIÃO DO OESTE',
    ];

    const counts = data.reduce((acc, curr) => {
      const cidade = curr.Cidade || 'NÃO INFORMADO';
      if (municipiosAtendidos.includes(cidade.toUpperCase())) {
        acc[cidade.toUpperCase()] = (acc[cidade.toUpperCase()] || 0) + 1;
      }
      return acc;
    }, {});

    const result = Object.entries(counts).map(([cidade, quantidade]) => ({
      cidade,
      quantidade,
    }));

    result.sort((a, b) => b.quantidade - a.quantidade);

    return result;
  };

  // Definir cores para os gráficos
  const COLORS = [
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#FF8042',
    '#A28FD0',
    '#FF6492',
    '#FF8C42',
    '#A2D0AF',
    '#D0A2A2',
    '#D0D0A2',
  ];

  // Obter os dados processados
  const internacoesPorHospital = getInternacoesPorHospital();
  const tiposDeInternacao = getTiposDeInternacao();
  const tiposDeAlta = getTiposDeAlta();
  const saidas = getSaidas();
  const clinicasAtendidas = getClinicasAtendidas();
  const microRegioesAtendidas = getMicroRegioesAtendidas();

  // Função para exportar o relatório como PDF usando html2pdf.js
  const exportToPDF = () => {
    setIsExporting(true); // Iniciar carregamento

    // Referência ao botão
    const exportButton = document.getElementById('export-button');

    // Adicionar a classe para esconder o botão
    if (exportButton) {
      exportButton.classList.add('hide-on-print');
    }

    // Opções para html2pdf.js
    const opt = {
      margin:       [10, 10, 10, 10], // Top, right, bottom, left em mm
      filename:     'Relatorio_CIS_URG.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 3, logging: false, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }, // Evita quebras em elementos importantes
    };

    html2pdf().set(opt).from(reportRef.current).save().then(() => {
      // Remover a classe para mostrar o botão novamente
      if (exportButton) {
        exportButton.classList.remove('hide-on-print');
      }
      setIsExporting(false); // Finalizar carregamento
    }).catch((error) => {
      console.error('Erro ao exportar PDF:', error);
      alert('Ocorreu um erro ao exportar o PDF. Por favor, tente novamente.');
      // Remover a classe mesmo em caso de erro
      if (exportButton) {
        exportButton.classList.remove('hide-on-print');
      }
      setIsExporting(false);
    });
  };

  return (
    <div className="report" ref={reportRef}>
      {/* Cabeçalho */}
      <div className="header flex justify-between items-center">
        <img src={CabecalhoLogo1} alt="Logo 1" className="header-image w-1/4" />
        <div className="text-center">
          <p className="font-bold">
            Consórcio Intermunicipal de Saúde da Região Ampliada Oeste para Gerenciamento dos
            Serviços de Urgência e Emergência – CIS-URG Oeste
          </p>
          <p>
            CNPJ: 20.059.618/0001-34 – (37) 3690-3200 –{' '}
            <a href="http://www.cisurg.oeste.mg.gov.br" target="_blank" rel="noopener noreferrer">
              www.cisurg.oeste.mg.gov.br
            </a>
          </p>
          <p>Unidade de Pronto Atendimento (UPA) Padre Roberto – Divinópolis/MG</p>
        </div>
        <img src={CabecalhoLogo2} alt="Logo 2" className="header-image w-1/4" />
      </div>

      {/* Botão para exportar o PDF */}
      <div className="export-section my-4 text-right">
        <button
          id="export-button" // Adicionado id para seleção
          onClick={exportToPDF}
          className={`bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isExporting}
        >
          {isExporting ? 'Exportando...' : 'Exportar para PDF'}
        </button>
      </div>

      {/* Metadados */}
      <div className="metadata my-4">
        <p>
          <strong>DATA:</strong> {metadata.date}
        </p>
        <p>
          <strong>SETOR:</strong> {metadata.sector}
        </p>
        <p>
          <strong>ELABORADO POR:</strong> {metadata.author}
        </p>
      </div>

      {/* Resumo */}
      <div className="resumo my-4">
        <h2 className="text-xl font-bold">RESUMO</h2>
        <p>{metadata.summary}</p>
      </div>

      {/* Seção 1: Número de Internações por Hospital */}
      <div className="section my-4">
        <h2 className="text-xl font-bold">1. NÚMERO DE INTERNAÇÕES POR HOSPITAIS</h2>
        <p>
          Este indicador informa a quantidade de aceites de pacientes que cada hospital recebeu no
          corrente mês.
        </p>
        <div className="chart-container my-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={internacoesPorHospital.slice(0, 10)} layout="vertical">
              <XAxis type="number" />
              <YAxis dataKey="hospital" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Seção 2: Tipos de Internação */}
      <div className="section my-4">
        <h2 className="text-xl font-bold">2. TIPOS DE INTERNAÇÃO</h2>
        <p>
          Além de aceites no SUSFÁCIL, podemos destacar outras modalidades de aceites em hospitais,
          bem como a transferência via SAMU - também chamada como transferência sem regulação e a
          compra de leito realizada pelo Estado.
        </p>
        <div className="chart-container my-4">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={tiposDeInternacao}
                dataKey="quantidade"
                nameKey="tipo"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {tiposDeInternacao.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Seção 3: Tipo de Alta */}
      <div className="section my-4">
        <h2 className="text-xl font-bold">3. TIPO DE ALTA</h2>
        <div>
          <p>As altas são divididas em:</p>
          <ul className="list-disc ml-6">
            <li>
              <strong>ALTA:</strong> conhecida como Alta Melhorada – Após o paciente passar algum
              tempo na UPA aguardando sua transferência e com melhora no seu quadro de saúde geral,
              o mesmo recebe alta para casa, sem a necessidade de transferência hospitalar.
            </li>
            <li>
              <strong>ALTA via SAD:</strong> na maioria dos casos, os pacientes são idosos cujo
              tratamento é continuado pela Atenção Primária do município, em suas residências.
            </li>
          </ul>
        </div>
        <table className="table-auto w-full mt-4">
          <thead>
            <tr>
              <th className="px-4 py-2">Tipo de Alta</th>
              <th className="px-4 py-2">Quantidade</th>
            </tr>
          </thead>
          <tbody>
            {tiposDeAlta.map((item, index) => (
              <tr key={index}>
                <td className="border px-4 py-2">{item.tipo}</td>
                <td className="border px-4 py-2 text-center">{item.quantidade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Seção 4: Saídas */}
      <div className="section my-4">
        <h2 className="text-xl font-bold">4. SAÍDAS</h2>
        <p>
          Além dos óbitos, inclui-se o total de evasões de pacientes na Instituição.
        </p>
        <table className="table-auto w-full mt-4">
          <thead>
            <tr>
              <th className="px-4 py-2">Tipo de Saída</th>
              <th className="px-4 py-2">Quantidade</th>
            </tr>
          </thead>
          <tbody>
            {saidas.map((item, index) => (
              <tr key={index}>
                <td className="border px-4 py-2">{item.tipo}</td>
                <td className="border px-4 py-2 text-center">{item.quantidade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Seção 5: Clínicas Atendidas */}
      <div className="section my-4">
        <h2 className="text-xl font-bold">5. CLÍNICAS ATENDIDAS</h2>
        <p>Quantidade de atendimentos por tipo de Clínica.</p>
        <div className="chart-container my-4">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={clinicasAtendidas.slice(0, 10)} layout="vertical">
              <XAxis type="number" />
              <YAxis dataKey="clinica" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="quantidade" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Seção 6: Micro-regiões atendidas pelo município de Divinópolis */}
      <div className="section my-4">
        <h2 className="text-xl font-bold">
          6. MICRO-REGIÕES ATENDIDAS PELO MUNICÍPIO DE DIVINÓPOLIS
        </h2>
        <p>
          Dentre as micro-regiões do município de Divinópolis, a UPA Padre Roberto Cordeiro é porta
          aberta para 5 municípios, ou seja, seus pacientes são atendidos e cadastrados no SUSFÁCIL
          através da Regulação da UPA. São eles: Araújos, Carmo do Cajuru, São Gonçalo do Pará, São
          Sebastião do Oeste, Perdigão. As demais cidades atendidas provêm de pacientes flutuantes.
        </p>
        <div className="chart-container my-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={microRegioesAtendidas} layout="vertical">
              <XAxis type="number" />
              <YAxis dataKey="cidade" type="category" width={200} />
              <Tooltip />
              <Bar dataKey="quantidade" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Report;
