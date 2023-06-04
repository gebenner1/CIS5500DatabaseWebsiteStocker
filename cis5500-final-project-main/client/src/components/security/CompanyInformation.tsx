import { Grid, Typography } from "@mui/material"

export const CompanyInformation = ({ headquarters, industry, avg_volume }: { headquarters: string, industry: string, avg_volume: number }) =>

    <Grid container sx={{ border: 1, width: 600, paddingBottom: 1, paddingLeft: 1 }} rowSpacing={1}>
        <Grid item xs={3}>
            <Typography>Headquarters:</Typography>
        </Grid>
        <Grid item xs={9}>
            <Typography>{headquarters}</Typography>
        </Grid>
        <Grid item xs={3}>
            <Typography>Industry:</Typography>
        </Grid>
        <Grid item xs={9}>
            <Typography>{industry}</Typography>
        </Grid>
        <Grid item xs={3}>
            <Typography>Average Volume:</Typography>
        </Grid>
        <Grid item xs={9}>
            <Typography>{avg_volume.toLocaleString()}</Typography>
        </Grid>
    </Grid>