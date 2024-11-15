import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

const ReportDisplay = ({ data, period }) => {
  if (!data || data.length === 0) return null;

  // Função auxiliar para validar e converter datas
  const parseDate = (dateStr) => {
    if (!dateStr || dateStr === 'EM ATENDIMENTO') return null;
    try {
      const [day, month, year] = dateStr.split('/').map(Number);
      return new Date(year, month - 1, day);
    } catch {
      return null;
    }
  };

  // Filtra os dados com validação melhorada
  const filteredData = data.filter(item => {
    if (!item?.Data_Entrada) return false;
    const entryDate = parseDate(item.Data_Entrada);
    if (!entryDate) return false;
    
    return (
      entryDate.getMonth() + 1 === period.month &&
      entryDate.getFullYear() === period.year
    );
  });

  // Melhoria no processamento dos dados de hospital
  const hospitalData = filteredData.reduce((acc, curr) => {
    const hospital = curr.Hospital?.trim() || 'NÃO INFORMADO';
    if (hospital !== 'NÃO INFORMADO') {
      acc[hospital] = (acc[hospital] || 0) + 1;
    }
    return acc;
  }, {});

  const hospitalChartData = Object.entries(hospitalData)
    .map(([hospital, quantidade]) => ({
      hospital: hospital.length > 20 ? hospital.substring(0, 20) + '...' : hospital,
      quantidade
    }))
    .sort((a, b) => b.quantidade - a.quantidade);

  // Tipos de internação
  const tiposInternacao = filteredData.reduce((acc, curr) => {
    const tipo = curr.Status.includes('INTERNAÇÃO') ? 'SUSFÁCIL' : 
                 curr.Status.includes('TRANSFERÊNCIA') ? 'SAMU' :
                 curr.Status.includes('COMPRA') ? 'COMPRA de LEITO' : null;
    if (tipo) acc[tipo] = (acc[tipo] || 0) + 1;
    return acc;
  }, {});

  // Tipos de alta
  const tiposAlta = filteredData.reduce((acc, curr) => {
    if (curr.Status === 'ALTA') acc['ALTA'] = (acc['ALTA'] || 0) + 1;
    if (curr.Status === 'ALTA VIA SAD') acc['ALTA VIA SAD'] = (acc['ALTA VIA SAD'] || 0) + 1;
    return acc;
  }, {});

  // Saídas
  const saidas = filteredData.reduce((acc, curr) => {
    if (curr.Status === 'ÓBITO') acc['ÓBITOS'] = (acc['ÓBITOS'] || 0) + 1;
    if (curr.Status === 'EVASÃO') acc['EVASÃO'] = (acc['EVASÃO'] || 0) + 1;
    return acc;
  }, {});

  // Clínicas atendidas
  const clinicasData = filteredData.reduce((acc, curr) => {
    if (curr.Setor === 'NÃO INFORMADO') return acc;
    acc[curr.Setor] = (acc[curr.Setor] || 0) + 1;
    return acc;
  }, {});

  // Micro-regiões
  const microRegioes = filteredData.reduce((acc, curr) => {
    const cidade = curr.Cidade || 'DIVINÓPOLIS';
    acc[cidade] = (acc[cidade] || 0) + 1;
    return acc;
  }, {});

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

  return (
    <div className="space-y-8 p-4">
      <Card>
        <CardHeader>
          <CardTitle>RELATÓRIO DE INDICADORES - {period.month}/{period.year}</CardTitle>
          <div className="text-sm text-gray-500">
            <p>SETOR: NIR</p>
            <p>ELABORADO POR: Equipe NIR</p>
            <p>DATA: {new Date().toLocaleDateString()}</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-12">
            {/* Resumo */}
            <div>
              <h3 className="text-lg font-semibold mb-4">RESUMO</h3>
              <p className="text-gray-600">
                Este documento busca acompanhar a eficiência das atividades desenvolvidas, além de avaliar se os resultados dessas atividades são de fato eficazes no cumprimento dos seus objetivos. Visa informar os hospitais de destino dos pacientes transferidos, número e tipo de internações, saídas, tipo de clínicas, enfim, todos os processos executáveis através do Núcleo Interno de Regulação.
              </p>
            </div>

            {/* Gráfico de Hospitais */}
            <div>
              <h3 className="text-lg font-semibold mb-4">1. NÚMERO DE INTERNAÇÕES POR HOSPITAIS</h3>
              <BarChart width={800} height={400} data={hospitalChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hospital" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" fill="#8884d8" />
              </BarChart>
            </div>

            {/* Tipos de Internação */}
            <div>
              <h3 className="text-lg font-semibold mb-4">2. TIPOS DE INTERNAÇÃO</h3>
              <PieChart width={400} height={300}>
                <Pie
                  data={Object.entries(tiposInternacao).map(([name, value]) => ({ name, value }))}
                  cx={200}
                  cy={150}
                  labelLine={true}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(tiposInternacao).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </div>

            {/* Tipos de Alta */}
            <div>
              <h3 className="text-lg font-semibold mb-4">3. TIPOS DE ALTA</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(tiposAlta).map(([tipo, qtd]) => (
                  <Card key={tipo}>
                    <CardContent className="p-4">
                      <p className="font-semibold">{tipo}</p>
                      <p className="text-2xl">{qtd}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Saídas */}
            <div>
              <h3 className="text-lg font-semibold mb-4">4. SAÍDAS</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(saidas).map(([tipo, qtd]) => (
                  <Card key={tipo}>
                    <CardContent className="p-4">
                      <p className="font-semibold">{tipo}</p>
                      <p className="text-2xl">{qtd}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Clínicas Atendidas */}
            <div>
              <h3 className="text-lg font-semibold mb-4">5. CLÍNICAS ATENDIDAS</h3>
              <BarChart width={800} height={400} data={Object.entries(clinicasData).map(([clinica, qtd]) => ({
                clinica,
                quantidade: qtd
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="clinica" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" fill="#82ca9d" />
              </BarChart>
            </div>

            {/* Micro-regiões */}
            <div>
              <h3 className="text-lg font-semibold mb-4">6. MICRO-REGIÕES ATENDIDAS</h3>
              <BarChart width={800} height={400} data={Object.entries(microRegioes).map(([cidade, qtd]) => ({
                cidade,
                quantidade: qtd
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cidade" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" fill="#ffc658" />
              </BarChart>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportDisplay; 