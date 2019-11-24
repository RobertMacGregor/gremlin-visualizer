import React from 'react';
import { connect } from 'react-redux';
import {
  ExpansionPanel,
  ExpansionPanelSummary,
  Typography,
  ExpansionPanelDetails,
  List,
  ListItem,
  ListItemText,
  TextField,
  Fab,
  IconButton,
  Grid,
  Table,
  TableBody,
  TableRow,
  TableCell
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import RefreshIcon from '@material-ui/icons/Refresh';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import _ from 'lodash';
import { JsonToTable } from 'react-json-to-table';
import { ACTIONS, COMMON_GREMLIN_ERROR, QUERY_ENDPOINT } from '../../constants';
import axios from "axios";
import { onFetchQuery} from '../../logics/actionHelper';

class Details extends React.Component {

  onAddNodeLabel() {
    this.props.dispatch({ type: ACTIONS.ADD_NODE_LABEL });
  }

  onEditNodeLabel(index, nodeLabel) {
    this.props.dispatch({ type: ACTIONS.EDIT_NODE_LABEL, payload: { id: index, nodeLabel } });
  }

  onRemoveNodeLabel(index) {
    this.props.dispatch({ type: ACTIONS.REMOVE_NODE_LABEL, payload: index });
  }

  onRefresh() {
    this.props.dispatch({ type: ACTIONS.REFRESH_NODE_LABELS, payload: this.props.nodeLabels });
  }

  onTraverse(nodeId, direction) {
    const query = `g.V('${nodeId}').${direction}()`;
    axios.post(
      QUERY_ENDPOINT,
      { host: this.props.host, port: this.props.port, query: query },
      { headers: { 'Content-Type': 'application/json' } }
    ).then((response) => {
      onFetchQuery(response, query, this.props.nodeLabels, this.props.dispatch);
    }).catch((error) => {
      this.props.dispatch({ type: ACTIONS.SET_ERROR, payload: COMMON_GREMLIN_ERROR });
    });
  }

  generateList(list) {
    let key = 0;
    return list.map(value => {
      key = key+1;
      return React.cloneElement((
        <ListItem>
          <ListItemText
            primary={value}
          />
        </ListItem>
      ), {
        key
      })
    });
  }

  generateNodeLabelList(nodeLabels) {
    let index = -1;
    return nodeLabels.map( nodeLabel => {
      index = index+1;
      nodeLabel.index = index;
      return React.cloneElement((
        <ListItem>
          <TextField id="standard-basic" label="Node Type" InputLabelProps={{ shrink: true }} value={nodeLabel.type} onChange={event => {
            const type = event.target.value;
            const field = nodeLabel.field;
            this.onEditNodeLabel(nodeLabel.index, { type, field })
          }}
          />
          <TextField id="standard-basic" label="Label Field" InputLabelProps={{ shrink: true }} value={nodeLabel.field} onChange={event => {
            const field = event.target.value;
            const type = nodeLabel.type;
            this.onEditNodeLabel(nodeLabel.index, { type, field })
          }}/>
          <IconButton aria-label="delete" size="small" onClick={() => this.onRemoveNodeLabel(nodeLabel.index)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </ListItem>
      ), {
        key: index
      })
    });
  }

  render(){
    let hasSelected = false;
    let selectedType = null;
    let selectedId = null ;
    let selectedProperties = null;
    let selectedHeader = null;
    if (!_.isEmpty(this.props.selectedNode)) {
      hasSelected = true;
      selectedType =  _.get(this.props.selectedNode, 'type');
      selectedId = _.get(this.props.selectedNode, 'id');
      selectedProperties = _.get(this.props.selectedNode, 'properties');
      selectedHeader = 'Node';
    } else if (!_.isEmpty(this.props.selectedEdge)) {
      hasSelected = true;
      selectedType =  _.get(this.props.selectedEdge, 'type');
      selectedId = _.get(this.props.selectedEdge, 'id');
      selectedProperties = _.get(this.props.selectedEdge, 'properties');
      selectedHeader = 'Edge';
    }


    return (
      <div className={'details'}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12} md={12}>
            <ExpansionPanel>
              <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography>Query History</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <List dense={true}>
                  {this.generateList(this.props.queryHistory)}
                </List>
              </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel>
              <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography>Node Labels</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={12} md={12}>
                    <List dense={true}>
                      {this.generateNodeLabelList(this.props.nodeLabels)}
                    </List>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12}>
                    <Fab variant="extended" color="primary" size="small" onClick={this.onRefresh.bind(this)}>
                      <RefreshIcon />
                      Refresh
                    </Fab>
                    <Fab variant="extended" size="small" onClick={this.onAddNodeLabel.bind(this)}>
                      <AddIcon />
                      Add Node Label
                    </Fab>
                  </Grid>
                </Grid>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </Grid>
          {hasSelected &&
          <Grid item xs={12} sm={12} md={12}>
            <h2>Information: {selectedHeader}</h2>
            {selectedHeader === 'Node' &&
            <Grid item xs={12} sm={12} md={12}>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={6} md={6}>
                  <Fab variant="extended" size="small" onClick={() => this.onTraverse(selectedId, 'out')}>
                    Traverse Out Edges
                    <ArrowForwardIcon/>
                  </Fab>
                </Grid>
                <Grid item xs={6} sm={6} md={6}>
                  <Fab variant="extended" size="small" onClick={() => this.onTraverse(selectedId, 'in')}>
                    Traverse In Edges
                    <ArrowBackIcon/>
                  </Fab>
                </Grid>
              </Grid>
            </Grid>
            }
            <Grid item xs={12} sm={12} md={12}>
              <Grid container>
                <Table aria-label="simple table">
                  <TableBody>
                    <TableRow key={'type'}>
                      <TableCell scope="row">Type</TableCell>
                      <TableCell align="left">{String(selectedType)}</TableCell>
                    </TableRow>
                    <TableRow key={'id'}>
                      <TableCell scope="row">ID</TableCell>
                      <TableCell align="left">{String(selectedId)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <JsonToTable json={selectedProperties}/>
              </Grid>
            </Grid>
          </Grid>
          }
        </Grid>
      </div>
    );
  }
}

export const DetailsComponent = connect((state)=>{
  return {
    host: state.gremlin.host,
    port: state.gremlin.port,
    selectedNode: state.graph.selectedNode,
    selectedEdge: state.graph.selectedEdge,
    queryHistory: state.options.queryHistory,
    nodeLabels: state.options.nodeLabels
  };
})(Details);