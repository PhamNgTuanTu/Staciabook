import { Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { useCart } from "react-hook-cart";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Collapse,
  Row,
} from "reactstrap";
import feeShipApi from "../../Api/feeShipAPi";
import { setDV, setPhiShip } from "../../store/address";

PanePay.propTypes = {};

function PanePay(props) {
  const { setActiveTab, setData } = props;
  const dispatch = useDispatch();
  const { totalItems, items, totalCost } = useCart();
  const { data, mes, dataForm, feeShip } = useSelector((state) => ({
    data: state.address.infoDv,
    mes: state.address.mesDv,
    dataForm: state.address.formData,
    feeShip: state.address.feeShip,
  }));

  const totalWeight = (data) => {
    let total = 0;
    if (JSON.stringify(data) !== "[]" && data.length > 0) {
      data.forEach((val) => {
        total += val.weight;
      });
    }
    return Number(total);
  };

  const loadDichVu = async () => {
    if (JSON.stringify(dataForm) !== "{}" && JSON.stringify(items) !== "[]") {
      try {
        const response = await feeShipApi.getDichVu(
          process.env.REACT_APP_TOKEN_SHOP,
          {
            shop_id: Number(process.env.REACT_APP_SHOP_ID),
            from_district: Number(process.env.REACT_APP_DIA_CHI_ID),
            to_district: dataForm.huyen,
          }
        );
        dispatch(setDV(response.data));
      } catch (error) {}
    }
  };

  const [activeColl, setActiveColl] = useState(true);

  const toggleActive = () => {
    setActiveColl(!activeColl);
  };

  const loadFeeDv = async () => {
    let arr = {};
    if (
      JSON.stringify(dataForm) !== "{}" &&
      JSON.stringify(items) !== "[]" &&
      JSON.stringify(data) !== "[]"
    ) {
      let idDV = 0;
      data.forEach((val) => {
        if (Number(val.service_type_id) === 2) {
          idDV = Number(val.service_id);
        }
      });
      arr = {
        service_id: idDV,
        insurance_value: totalCost,
        coupon: null,
        from_district_id: Number(process.env.REACT_APP_DIA_CHI_ID),
        to_district_id: dataForm.huyen,
        to_ward_code: dataForm.xa,
        height: items[0].height,
        length: items[0].length,
        weight: totalWeight(items),
        width: items[0].width,
      };
      const response = await feeShipApi.feeDichVu(
        process.env.REACT_APP_TOKEN_SHOP,
        arr
      );
      dispatch(setPhiShip(response.data.data.total));
    }
  };

  const [loadingPane, setLoadingPane] = useState(false);

  const handleClick = async () => {
    setLoadingPane(true);
    await new Promise((r) => setTimeout(r, 1000));
    if (
      JSON.stringify(dataForm) !== "{}" &&
      JSON.stringify(items) !== "[]" &&
      JSON.stringify(data) !== "[]"
    ) {
      setData((preState) => ({
        ...preState,
        shipping_fee: feeShip,
        total_payment: feeShip + totalCost,
      }));
      setActiveTab(3);
      setLoadingPane(false);
    }
  };

  useEffect(() => {
    loadFeeDv();
    // eslint-disable-next-line
  }, [data, dataForm]);

  useEffect(() => {
    loadDichVu();
    // eslint-disable-next-line
  }, [dataForm]);

  return (
    <Card body outline color="primary" className="mt-4">
      <h5>H??nh th???c thanh to??n</h5>
      <CardBody>
        <Row>
          <Col md="6">
            <h5 className="tick-ship" onClick={toggleActive}>
              <i className="fas fa-check-circle mr-2"></i>
              <strong>Thanh To??n Khi Nh???n H??ng</strong>
              <i
                className={
                  activeColl
                    ? "fas fa-chevron-circle-right icon-open-coll active-icon-open-coll"
                    : "fas fa-chevron-circle-right icon-open-coll"
                }
              ></i>
            </h5>
            <Collapse isOpen={activeColl} className="mb-2">
              <Card>
                <CardBody>
                  <em>{JSON.stringify(mes) !== "[]" ? mes : ""}</em>
                  <Row>
                    <Col>
                      <Formik
                        initialValues={{
                          service: "2",
                        }}
                      >
                        {({ values }) => (
                          <Form>
                            <div id="my-radio-group">
                              <strong>H??nh th???c giao h??ng</strong>
                            </div>
                            {JSON.stringify(data) !== "[]" &&
                            data.length > 0 ? (
                              <>
                                {data.map((val, i) => {
                                  return (
                                    <label
                                      key={i}
                                      className="ml-2"
                                      style={{ cursor: "pointer" }}
                                    >
                                      <input
                                        className="mr-2"
                                        type="radio"
                                        name="service"
                                        // onChange={() => handleChange(values)}
                                        defaultChecked={
                                          Number(val.service_type_id) === 2
                                            ? true
                                            : false
                                        }
                                        value={`${val.service_type_id}`}
                                      />
                                      {Number(val.service_type_id) === 1
                                        ? "Giao h??ng nhanh"
                                        : null}
                                      {Number(val.service_type_id) === 2
                                        ? "Giao h??ng ti??u chu???n"
                                        : null}
                                      {Number(val.service_type_id) === 3
                                        ? "Giao h??ng ti???t ki???m"
                                        : null}
                                    </label>
                                  );
                                })}
                                {/* {handleChange(values)} */}
                              </>
                            ) : null}
                          </Form>
                        )}
                      </Formik>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Collapse>
            <span>
              Nh??n vi??n Giao h??ng c???a StaciaBook ho???c B??u ??i???n s??? thu ti???n m???t
              khi giao h??ng cho Qu?? kh??ch. Trong tr?????ng h???p Qu?? kh??ch nh??? ng?????i
              nh???n gi??p, vui l??ng th??ng b??o s??? ti???n thanh to??n cho ng?????i nh??.
            </span>
          </Col>
          <Col md="6">
            <Card color="success" outline style={{ border: "none" }}>
              <CardHeader className="card-header-detail">
                <h5>
                  <strong>Th??ng tin ????n h??ng</strong>
                </h5>
              </CardHeader>
              <CardBody className="card-body-border">
                <Row>
                  <Col md="6">
                    <span>T???ng s??? s???n ph???m:</span>
                  </Col>
                  <Col md="6" style={{ textAlign: "end" }}>
                    <strong>{totalItems}</strong>
                  </Col>
                </Row>
                {JSON.stringify(items) !== "[]" && items.length > 0
                  ? items.map((val, i) => {
                      return (
                        <Row key={i} className="mt-3">
                          <Col
                            md="12"
                            className="d-flex align-items-center justify-content-between"
                          >
                            <img
                              style={{
                                height: "80px",
                                maxWidth: "50px",
                                objectFit: "cover",
                              }}
                              src={`${process.env.REACT_APP_API_URL}/images/${val.image}`}
                              alt={val.name}
                            />
                            <div className="w-100 ml-2">
                              <Row>
                                <Col className="ml-2">
                                  <span>{val.name}</span>
                                </Col>
                              </Row>
                              <Row>
                                <Col className="ml-2">
                                  <strong>
                                    {`${
                                      val.quantity
                                    } x ${val.price.toLocaleString("it-IT", {
                                      style: "currency",
                                      currency: "VND",
                                    })}`}
                                  </strong>
                                </Col>
                              </Row>
                            </div>
                          </Col>
                        </Row>
                      );
                    })
                  : null}
                <Row className="mt-3">
                  <Col md="5">
                    <span>T???ng ti???n s??ch:</span>
                  </Col>
                  <Col md="7" style={{ textAlign: "end" }}>
                    <strong>
                      {totalCost.toLocaleString("it-IT", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </strong>
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col md="5">
                    <span>Ph?? v???n chuy???n:</span>
                  </Col>
                  <Col md="7" style={{ textAlign: "end" }}>
                    <strong>
                      {feeShip.toLocaleString("it-IT", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </strong>
                  </Col>
                </Row>
                <hr className="main-hr" />
                <Row className="mt-3">
                  <Col md="12" style={{ textAlign: "center" }}>
                    <span className="mr-2">T???ng c???ng:</span>
                    <strong className="color-total">
                      {(feeShip + totalCost).toLocaleString("it-IT", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </strong>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row className="mt-4">
          <Col md="12">
            <div className="form-group form-group-btn d-flex align-items-baseline justify-content-end">
              <Button
                type="reset"
                className="mr-3"
                block
                onClick={() => setActiveTab(1)}
              >
                Tr??? l???i
              </Button>
              <Button
                color="primary"
                type="button"
                disabled={loadingPane}
                block
                onClick={handleClick}
              >
                {loadingPane ? "Vui l??ng ch???" : "Ti???p theo"}
              </Button>
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
}

export default PanePay;
