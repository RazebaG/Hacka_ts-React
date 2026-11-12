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
        title="Existe uma versão mais nova deste documento"
      >
        Versão antiga
      </span>
    );
  }

  return (
    <span
      data-testid="badge-status-vigente"
      className="badge badge-vigente"
      title="Esta é a versão que vale hoje"
    >
      {fase && fase !== 'Vigente' ? fase : 'Em vigor'}
    </span>
  );
};
