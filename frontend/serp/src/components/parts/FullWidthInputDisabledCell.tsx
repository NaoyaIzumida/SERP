import { GridRenderEditCellParams, useGridApiContext } from '@mui/x-data-grid';
import TextField from '@mui/material/TextField';

const FullWidthInputDisabledCell = (params: GridRenderEditCellParams, /* maxLength : number */) => {

  const apiRef = useGridApiContext();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;

    // 全角文字を検出
    const hasFullWidth = /[^\u0020-\u007E]/.test(input);
    if (hasFullWidth) {
      return;
    }

    apiRef.current.setEditCellValue({
      id: params.id,
      field: params.field,
      value: input,
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      apiRef.current.stopCellEditMode({ id: params.id, field: params.field });
    }
  };

  return (
    <TextField
      autoFocus
      defaultValue={params.value}
      fullWidth
      onChange={handleChange}
      onKeyDown={handleKeyDown}
    />
  );
};

export default FullWidthInputDisabledCell;