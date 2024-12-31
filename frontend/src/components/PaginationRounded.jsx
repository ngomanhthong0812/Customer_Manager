import * as React from 'react';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

export default function PaginationRounded({ totalPages, page, setPage }) {
    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };
    return (
        <Stack spacing={2}>
            <Pagination
                count={totalPages}
                page={page}
                variant="outlined"
                shape="rounded"
                onChange={handlePageChange}
            />
        </Stack>
    );
}