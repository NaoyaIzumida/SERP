import { GridRenderEditCellParams, useGridApiContext } from '@mui/x-data-grid';
import TextField from '@mui/material/TextField';
import React, { useState } from 'react';

interface CustomEditCellProps extends GridRenderEditCellParams {
  maxLength?: number;
}

const FullWidthInputDisabledCell = (params: CustomEditCellProps) => {
  const apiRef = useGridApiContext();
  const [value, setValue] = useState(params.value ?? '');
  const maxLength = params.maxLength ?? 5; // デフォルト値

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;

    // 全角文字を検出
    const hasFullWidth = /[^\u0020-\u007E]/.test(input);
    if (hasFullWidth) return;

    setValue(input);

    apiRef.current.setEditCellValue({
      id: params.id,
      field: params.field,
      value: input,
    });
  };

  // 入力文字数チェック
  const inputValueLengthCheck = () => {
    let trimmedValue = value;
    if (value.length > maxLength) {
      trimmedValue = value.slice(0, maxLength);
      setValue(trimmedValue);
      apiRef.current.setEditCellValue({
        id: params.id,
        field: params.field,
        value: trimmedValue,
      });
    }

    apiRef.current.stopCellEditMode({ id: params.id, field: params.field });
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      inputValueLengthCheck();
    }
  };

  const handleBlur = () => {
    inputValueLengthCheck();
  };

  return (
    <TextField
      autoFocus
      value={value}
      fullWidth
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    />
  );
};

export default FullWidthInputDisabledCell;
