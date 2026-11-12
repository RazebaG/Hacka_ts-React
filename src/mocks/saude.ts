import { SaudeResponse } from '../api/types';
import { MOCK_DOCUMENTOS } from './documentos';

export const MOCK_SAUDE: SaudeResponse = {
  status: 'ok',
  documentos: MOCK_DOCUMENTOS.length,
  ia: "extrativo",
  data_referencia: "2026-11-12"
};
