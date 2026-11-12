import React from 'react';

interface BadgeStatusProps {
  substituido: boolean;
  fase?: string;
}

export const BadgeStatus: React.FC<BadgeStatusProps> = ({ substituido, fase }) => {
  if (substituido) {
    return (
      <span
        data-testid="badge-status-substituido"
        className="badge badge-substituido"
        title="Documento revogado ou substituído por versão mais recente"
      >
        Substituído
      </span>
    );
  }

  return (
    <span
      data-testid="badge-status-vigente"
      className="badge badge-vigente"
      title="Documento atualmente em vigor"
    >
      {fase || 'Vigente'}
    </span>
  );
};
