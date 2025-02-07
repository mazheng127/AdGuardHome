import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Field, reduxForm, formValueSelector } from 'redux-form';
import { Trans, withNamespaces } from 'react-i18next';
import flow from 'lodash/flow';

import { renderField, required, ipv4, isPositive, toNumber } from '../../../helpers/form';

const renderInterfaces = (interfaces => (
    Object.keys(interfaces).map((item) => {
        const option = interfaces[item];
        const { name } = option;
        const onlyIPv6 = option.ip_addresses.every(ip => ip.includes(':'));
        let interfaceIP = option.ip_addresses[0];

        if (!onlyIPv6) {
            option.ip_addresses.forEach((ip) => {
                if (!ip.includes(':')) {
                    interfaceIP = ip;
                }
            });
        }

        return (
            <option value={name} key={name} disabled={onlyIPv6}>
                {name} - {interfaceIP}
            </option>
        );
    })
));

const renderInterfaceValues = (interfaceValues => (
    <ul className="list-unstyled mt-1 mb-0">
        <li>
            <span className="interface__title">MTU: </span>
            {interfaceValues.mtu}
        </li>
        <li>
            <span className="interface__title"><Trans>dhcp_hardware_address</Trans>: </span>
            {interfaceValues.hardware_address}
        </li>
        <li>
            <span className="interface__title"><Trans>dhcp_ip_addresses</Trans>: </span>
            {
                interfaceValues.ip_addresses
                    .map(ip => <span key={ip} className="interface__ip">{ip}</span>)
            }
        </li>
    </ul>
));

const clearFields = (change, resetDhcp, t) => {
    const fields = {
        interface_name: '',
        gateway_ip: '',
        subnet_mask: '',
        range_start: '',
        range_end: '',
        lease_duration: 86400,
    };

    // eslint-disable-next-line no-alert
    if (window.confirm(t('dhcp_reset'))) {
        Object.keys(fields).forEach(field => change(field, fields[field]));
        resetDhcp();
    }
};

let Form = (props) => {
    const {
        t,
        handleSubmit,
        submitting,
        invalid,
        enabled,
        interfaces,
        interfaceValue,
        processingConfig,
        processingInterfaces,
        resetDhcp,
        change,
    } = props;

    return (
        <form onSubmit={handleSubmit}>
            {!processingInterfaces && interfaces &&
                <div className="row">
                    <div className="col-sm-12 col-md-6">
                        <div className="form__group form__group--settings">
                            <label>{t('dhcp_interface_select')}</label>
                            <Field
                                name="interface_name"
                                component="select"
                                className="form-control custom-select"
                                validate={[required]}
                            >
                                <option value="" disabled={enabled}>
                                    {t('dhcp_interface_select')}
                                </option>
                                {renderInterfaces(interfaces)}
                            </Field>
                        </div>
                    </div>
                    {interfaceValue &&
                        <div className="col-sm-12 col-md-6">
                            {interfaces[interfaceValue] &&
                                renderInterfaceValues(interfaces[interfaceValue])}
                        </div>
                    }
                </div>
            }
            <hr/>
            <div className="row">
                <div className="col-lg-6">
                    <div className="form__group form__group--settings">
                        <label>{t('dhcp_form_gateway_input')}</label>
                        <Field
                            name="gateway_ip"
                            component={renderField}
                            type="text"
                            className="form-control"
                            placeholder={t('dhcp_form_gateway_input')}
                            validate={[ipv4, required]}
                        />
                    </div>
                    <div className="form__group form__group--settings">
                        <label>{t('dhcp_form_subnet_input')}</label>
                        <Field
                            name="subnet_mask"
                            component={renderField}
                            type="text"
                            className="form-control"
                            placeholder={t('dhcp_form_subnet_input')}
                            validate={[ipv4, required]}
                        />
                    </div>
                </div>
                <div className="col-lg-6">
                    <div className="form__group form__group--settings">
                        <div className="row">
                            <div className="col-12">
                                <label>{t('dhcp_form_range_title')}</label>
                            </div>
                            <div className="col">
                                <Field
                                    name="range_start"
                                    component={renderField}
                                    type="text"
                                    className="form-control"
                                    placeholder={t('dhcp_form_range_start')}
                                    validate={[ipv4, required]}
                                />
                            </div>
                            <div className="col">
                                <Field
                                    name="range_end"
                                    component={renderField}
                                    type="text"
                                    className="form-control"
                                    placeholder={t('dhcp_form_range_end')}
                                    validate={[ipv4, required]}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="form__group form__group--settings">
                        <label>{t('dhcp_form_lease_title')}</label>
                        <Field
                            name="lease_duration"
                            component={renderField}
                            type="number"
                            className="form-control"
                            placeholder={t('dhcp_form_lease_input')}
                            validate={[required, isPositive]}
                            normalize={toNumber}
                        />
                    </div>
                </div>
            </div>

            <div className="btn-list">
                <button
                    type="submit"
                    className="btn btn-success btn-standard"
                    disabled={submitting || invalid || processingConfig}
                >
                    {t('save_config')}
                </button>
                <button
                    type="button"
                    className="btn btn-secondary btn-standart"
                    disabled={submitting || processingConfig}
                    onClick={() => clearFields(change, resetDhcp, t)}
                >
                    <Trans>reset_settings</Trans>
                </button>
            </div>
        </form>
    );
};

Form.propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    invalid: PropTypes.bool.isRequired,
    interfaces: PropTypes.object.isRequired,
    interfaceValue: PropTypes.string,
    initialValues: PropTypes.object.isRequired,
    processingConfig: PropTypes.bool.isRequired,
    processingInterfaces: PropTypes.bool.isRequired,
    enabled: PropTypes.bool.isRequired,
    t: PropTypes.func.isRequired,
    resetDhcp: PropTypes.func.isRequired,
    change: PropTypes.func.isRequired,
};

const selector = formValueSelector('dhcpForm');

Form = connect((state) => {
    const interfaceValue = selector(state, 'interface_name');
    return {
        interfaceValue,
    };
})(Form);

export default flow([
    withNamespaces(),
    reduxForm({ form: 'dhcpForm' }),
])(Form);
