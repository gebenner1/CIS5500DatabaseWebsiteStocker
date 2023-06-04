import { Box, Grid, List, ListItem, Tab, Tabs, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { Company, News } from "./Security";
import { useState } from "react";


interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export function SecuritySidebar(competitors: (string | Company)[] | undefined, news1: News[] | undefined, news2: News[] | undefined, news3: News[] | undefined) {

    const [value, setValue] = useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return <Grid container>
        <Grid item xs={12}>
            <Typography variant="h6">Competitors</Typography>
            <List sx={{ border: 1 }}>
                {competitors?.map(company => typeof (company) === "string" ? <ListItem>{company}</ListItem> : <ListItem component={Link} to={`/security/${company?.ticker}`} sx={{ textDecoration: "none", color: "inherit" }}>{company?.ticker}</ListItem>)}
            </List>
        </Grid>
        <Grid item xs={12}>
            <Typography variant="h6">Related Headlines</Typography>
            <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                <Tab label="Percent Change" {...a11yProps(0)} sx={{ margin: -1 }} />
                <Tab label="High" {...a11yProps(1)} sx={{ margin: -1 }} />
                <Tab label="New" {...a11yProps(2)} sx={{ margin: -1 }} />
            </Tabs>
            <TabPanel value={value} index={0}>
                <Typography variant="body2">Headlines trending the day of this stock's best performance (as measured by percent change).</Typography>
                <List sx={{ border: 1 }}>
                    {news1?.map(item => <ListItem>
                        <Typography>
                            {item.headline}
                            <Typography variant="body2" textAlign="right">{item.date}</Typography>
                        </Typography>
                    </ListItem>)}
                </List>
            </TabPanel>
            <TabPanel value={value} index={1}>
                <Typography variant="body2">Headlines trending the day of this stock's best performance (as measured by closing value).</Typography>
                <List sx={{ border: 1 }}>
                    {news2?.map(item => <ListItem>
                        <Typography>
                            {item.headline}
                            <Typography variant="body2" textAlign="right">{item.date}</Typography>
                        </Typography>
                    </ListItem>)}
                </List>
            </TabPanel>
            <TabPanel value={value} index={2}>
                <Typography variant="body2">Recent headlines related to this stock.</Typography>
                <List sx={{ border: 1 }}>
                    {news3?.map(item => <ListItem>
                        <Typography>
                            {item.headline}
                            <Typography variant="body2" textAlign="right">{item.date}</Typography>
                        </Typography>
                    </ListItem>)}
                </List>
            </TabPanel>
        </Grid>
    </Grid >;
}
