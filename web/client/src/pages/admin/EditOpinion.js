import React, { useEffect, useState } from 'react';
import CreateOpinion from './CreateOpinion';

// Thin wrapper: reuses CreateOpinion logic (it already supports editing via :id param)
// This allows future divergence (e.g., diff viewer) without touching the create file.
const EditOpinion = () => {
  return <CreateOpinion />;
};

export default EditOpinion;
