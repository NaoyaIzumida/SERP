import { TextField } from '@mui/material';
import { GridRenderEditCellParams, useGridApiContext } from '@mui/x-data-grid';
import React from 'react';

interface CustomEditCellProps extends GridRenderEditCellParams {
  maxNumber?: number;
}

const MaxNumberEditCell: React.FC<GridRenderEditCellParams> = (params: CustomEditCellProps) => {
  const apiRef = useGridApiContext();
  const maxValue = params.maxNumber ?? 2147483647;  // default:integer

  // valueを文字列で扱う(値を消すと0が勝手に入力されるため)
  const stringValue = params.value !== undefined && params.value !== null ? String(params.value) : '';

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;

    // ユーザーが入力を消している間は許容
    if (inputValue === '') {
      apiRef.current.setEditCellValue({ 
        id: params.id,
        field: params.field, 
        value: '' }, event);
      return;
    }

    // 入力が数値かチェック
    const newValue = Number(inputValue);
    if (!isNaN(newValue) && newValue <= maxValue && newValue >= 0) {
      apiRef.current.setEditCellValue({ 
        id: params.id, 
        field: params.field,
        value: newValue }, event);
    } else {
      // ここで何もしない＝入力値を無視する
    }
  };

  return (
    <TextField
      type="number"
      value={stringValue}
      onChange={handleChange}
      inputProps={{ max: maxValue, min: 0 }}
      fullWidth
    />
  );
};

export default MaxNumberEditCell;
