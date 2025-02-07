import React, { Component, Fragment } from 'react';
import { HashRouter, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withNamespaces } from 'react-i18next';
import LoadingBar from 'react-redux-loading-bar';

import 'react-table/react-table.css';
import '../ui/Tabler.css';
import '../ui/ReactTable.css';
import './index.css';

import Header from '../../containers/Header';
import Dashboard from '../../containers/Dashboard';
import Settings from '../../containers/Settings';
import Filters from '../../containers/Filters';

import Dns from '../../containers/Dns';
import Encryption from '../../containers/Encryption';
import Dhcp from '../../containers/Dhcp';
import Clients from '../../containers/Clients';

import Logs from '../../containers/Logs';
import SetupGuide from '../../containers/SetupGuide';
import Toasts from '../Toasts';
import Footer from '../ui/Footer';
import Status from '../ui/Status';
import UpdateTopline from '../ui/UpdateTopline';
import UpdateOverlay from '../ui/UpdateOverlay';
import EncryptionTopline from '../ui/EncryptionTopline';
import Icons from '../ui/Icons';
import i18n from '../../i18n';
import Loading from '../ui/Loading';

class App extends Component {
    componentDidMount() {
        this.props.getDnsStatus();
    }

    componentDidUpdate(prevProps) {
        if (this.props.dashboard.language !== prevProps.dashboard.language) {
            this.setLanguage();
        }
    }

    reloadPage = () => {
        window.location.reload();
    };

    handleUpdate = () => {
        this.props.getUpdate();
    };

    setLanguage = () => {
        const { processing, language } = this.props.dashboard;

        if (!processing) {
            if (language) {
                i18n.changeLanguage(language);
            }
        }

        i18n.on('languageChanged', (lang) => {
            this.props.changeLanguage(lang);
        });
    };

    render() {
        const { dashboard, encryption, getVersion } = this.props;
        const updateAvailable = dashboard.isCoreRunning && dashboard.isUpdateAvailable;

        return (
            <HashRouter hashType="noslash">
                <Fragment>
                    {updateAvailable && (
                        <Fragment>
                            <UpdateTopline
                                url={dashboard.announcementUrl}
                                version={dashboard.newVersion}
                                canAutoUpdate={dashboard.canAutoUpdate}
                                getUpdate={this.handleUpdate}
                                processingUpdate={dashboard.processingUpdate}
                            />
                            <UpdateOverlay processingUpdate={dashboard.processingUpdate} />
                        </Fragment>
                    )}
                    {!encryption.processing && (
                        <EncryptionTopline notAfter={encryption.not_after} />
                    )}
                    <LoadingBar className="loading-bar" updateTime={1000} />
                    <Route component={Header} />
                    <div className="container container--wrap">
                        {dashboard.processing && !dashboard.isCoreRunning && (
                            <div className="row row-cards">
                                <div className="col-lg-12">
                                    <Status reloadPage={this.reloadPage}
                                            message="dns_start"
                                    />
                                    <Loading />
                                </div>
                            </div>
                        )}
                        {!dashboard.processing && dashboard.isCoreRunning && (
                            <Fragment>
                                <Route path="/" exact component={Dashboard} />
                                <Route path="/settings" component={Settings} />
                                <Route path="/dns" component={Dns} />
                                <Route path="/encryption" component={Encryption} />
                                <Route path="/dhcp" component={Dhcp} />
                                <Route path="/clients" component={Clients} />
                                <Route path="/filters" component={Filters} />
                                <Route path="/logs" component={Logs} />
                                <Route path="/guide" component={SetupGuide} />
                            </Fragment>
                        )}
                    </div>
                    <Footer
                        dnsVersion={dashboard.dnsVersion}
                        dnsPort={dashboard.dnsPort}
                        processingVersion={dashboard.processingVersion}
                        getVersion={getVersion}
                    />
                    <Toasts />
                    <Icons />
                </Fragment>
            </HashRouter>
        );
    }
}

App.propTypes = {
    getDnsStatus: PropTypes.func,
    getUpdate: PropTypes.func,
    enableDns: PropTypes.func,
    dashboard: PropTypes.object,
    isCoreRunning: PropTypes.bool,
    error: PropTypes.string,
    changeLanguage: PropTypes.func,
    encryption: PropTypes.object,
    getVersion: PropTypes.func,
};

export default withNamespaces()(App);
