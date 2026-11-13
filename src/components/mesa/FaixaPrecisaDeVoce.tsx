import React from 'react';
import { FichaDocumento } from '../../api/types';
import { Icon } from '../../ui/Icon';
import { dataBR, minusculaInicial, semPonto } from './comum';

const URGENCIA = ['alta', 'media', 'baixa'];

/** "Precisa de você": a ação mais urgente; sem ação, o alerta que muda a decisão (ex.: regra que mudou de versão). */
export const FaixaPrecisaDeVoce: React.FC<{ ficha: FichaDocumento }> = ({ ficha }) => {
  const acao = [...ficha.acoes].sort((a, b) => URGENCIA.indexOf(a.urgencia) - URGENCIA.indexOf(b.urgencia))[0];
  const alertaChave = ficha.alertas.find((a) => a.tipo === 'versao_substituida') ?? ficha.alertas.find((a) => a.tipo === 'divergencia' || a.tipo === 'vigencia_proxima');

  if (acao) {
    return (
      <div className="mesa-precisa tom-aviso" data-testid="mesa-precisa" role="note">
        <Icon nome="alerta" tamanho={18} />
        <div>
          <p className="mesa-precisa-titulo">
            Precisa de você: {minusculaInicial(acao.acao)}
            {acao.prazo?.data && <> até {dataBR(acao.prazo.data)}</>}
          </p>
          <p className="mesa-precisa-apoio">
            {acao.quem && <>Responsável: {acao.quem}. </>}
            {acao.consequencia && semPonto(acao.consequencia) + '.'}
          </p>
        </div>
      </div>
    );
  }
  if (alertaChave) {
    return (
      <div className={`mesa-precisa tom-${alertaChave.tipo === 'versao_substituida' ? 'perigo' : 'aviso'}`} data-testid="mesa-precisa" role="note">
        <Icon nome="alerta" tamanho={18} />
        <div>
          <p className="mesa-precisa-titulo">
            {alertaChave.tipo === 'versao_substituida' ? 'A regra mudou: ' : 'Atenção: '}
            {minusculaInicial(semPonto(alertaChave.titulo))}
          </p>
          <p className="mesa-precisa-apoio">{alertaChave.explicacao}</p>
        </div>
      </div>
    );
  }
  return (
    <p className="mesa-precisa tom-neutro" data-testid="mesa-precisa">
      <Icon nome="info" tamanho={16} />{' '}
      {ficha.modo.ia === 'extrativo' ? 'Sem IA, as ações com responsável não são escritas. Prazos e responsáveis estão nos blocos abaixo.' : 'Nada pede ação sua neste documento agora.'}
    </p>
  );
};
