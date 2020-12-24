import React, { Component } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Keyboard } from "react-native";
import { connect } from "react-redux";
import { Avatar } from "react-native-elements";
import { LoginPhone } from "../../../../action/authAction";
var qs = require("qs");
import {
  sizeHeight,
  sizeFont,
  sizeWidth,
} from "../../../../utils/helper/size.helper";
import {
  alphanumeric,
  checkFullName,
  isVietnamesePhoneNumber,
  checkAccountBank,
  validateEmail,
  checkAgent,
} from "../../../../utils/check";
import ComponentTextInput, {
  FormTextInput,
  FormTextInputNoIcon,
} from "../../../../components/textinput";
import ImagePicker from "react-native-image-picker";
// import Clipboard from '@react-native-community/clipboard';
import { _retrieveData } from "../../../../utils/asynStorage";
import { USER_NAME, PASSWORD } from "../../../../utils/asynStorage/store";
import { COLOR } from "../../../../utils/color/colors";
import { TextInput, Provider } from "react-native-paper";
import IconComponets from "../../../../components/icon";
import styles from "./style";
import moment from "moment";
import AlertDesignNotification from "../../../../components/alert/AlertDesignNotification";
import { UpdateInforAccount } from "../../../../service/account";
import api from "../../../../api";
import axios from "axios";
import {bank} from './bank/listbank';
import Spinner from "react-native-loading-spinner-overlay";
import { ElementCustom, AlertCommon } from "../../../../components/error";
import ListBank from "./bank";
import { GetProfile } from "../../../../action/authAction";
import DateTimePickerModal from "react-native-modal-datetime-picker";
const options = {
  title: "Select Avatar",
  storageOptions: {
    skipBackup: true,
    path: "images",
  },
  maxWidth: 720,
  maxHeight: 1080,
};
class UpdateInformation extends Component {
  constructor(props) {
    super(props);
    const { authUser } = this.props;
    this.state = {
      phoneText: authUser.MOBILE,
      userName: authUser.FULL_NAME,
      idStore: authUser.USER_CODE,
      levelStore: authUser.GROUPS,
      nameLogin: authUser.USERNAME,
      email: authUser.EMAIL ? authUser.EMAIL : "",
      dayOfBirth: authUser.DOB
        ? moment(authUser.DOB, "DD/MM/YYYY").format("DD/MM/YYYY")
        : moment("01/01/1990").format("DD/MM/YYYY"),
      gender: authUser.GENDER == 'Nam' ? 1 : 0,
      address: authUser.ADDRESS ? authUser.ADDRESS : "",
      passport: authUser.SO_CMT ? authUser.SO_CMT : "",
      account: authUser.STK ? authUser.STK : "",
      nameAccount: authUser.TENTK ? authUser.TENTK : "",
      nameBank: authUser.TEN_NH ? authUser.TEN_NH : "",
      showAlert: false,
      brankBank: '',

      rose: authUser.COMISSION,
      city:
        authUser.CITY == null
          ? ""
          : {
            NAME: authUser.CITY,
            MATP: authUser.CITY_ID,
          },
      district:
        authUser.DISTRICT == null
          ? ""
          : {
            NAME: authUser.DISTRICT,
            MAQH: authUser.DISTRICT_ID,
          },
      districChild:
        authUser.WARD == null
          ? ""
          : {
            NAME: authUser.WARD,
            XAID: authUser.WARD_ID,
          },
      loading: false,
      imageAvatar: !authUser.AVATAR ? "" : authUser.AVATAR,
      CMT_1: authUser.IMG1 ? authUser.IMG1 : "",
      CMT_2: authUser.IMG2 ? authUser.IMG2 : "",
      showCalendar: false,
    };
    this.message = "";
    this.message = "";
    this.refs.focusFullName;
    this.refs.focusPhone;
    this.refs.focusBankNum;
    this.refs.focusEmail;
    this.refs.focusBrank;
    this.refs.focusNameBank;
    this.refs.foucsAddress;
    this.refs.focusCMNN;
    this.focusPassport;
  }

  handleDate = (item) => {
    this.setState({ showCalendar: false }, () =>
      this.setState({ dayOfBirth: moment(item).format("DD/MM/YYYY") })
    );
  };
  updateAccount = () => {
    const {
      gender,
      userName,
      passport,
      district,
      districChild,
      city,
      address,
      account,
      nameAccount,
      nameBank,
      imageAvatar,
      CMT_1,
      CMT_2,
      dayOfBirth,
      phoneText,
      email,
      brankBank,
    } = this.state;
    const { authUser } = this.props;
    Keyboard.dismiss();
    if (userName.trim() === "") {
      return AlertCommon(
        "Thông báo",
        "Nhập họ và tên chỉ gồm chữ và số không có kí tự đăc biệt và nhỏ hơn 50 kí tự",
        () => this.focusFullName.focus()
      );
    } else if (
      phoneText.trim() === "" ||
      !isVietnamesePhoneNumber(phoneText) ||
      phoneText.length > 10
    ) {
      return AlertCommon(
        "Thông báo",
        "Nhập đúng số điện thoại 0xxxxxxxxx",
        () => this.focusPhone.focus()
      );
    } else if (
      (!checkAccountBank(account) || account.length < 7) &&
      account.trim() !== ""
    ) {
      AlertCommon(
        "Thông báo",
        "Tài khoản ngân hàng chỉ gồm số và lớn hơn 7 chữ số",
        () => this.focusBankNum.focus()
      );
    } else if (!validateEmail(email) && email.trim().length !== 0) {
      AlertCommon("Thông báo", "Nhập đúng email", () =>
        this.focusEmail.focus()
      );
    } else if (account.length > 20) {
      AlertCommon("Thông báo", "Tài ngân hàng khoản nhỏ hơn 20 chữ số", () =>
        this.focusBankNum.focus()
      );
    } else if (
      nameAccount.trim() !== "" &&
      (!checkAgent(nameAccount) || nameAccount.length > 50)
    ) {
      AlertCommon(
        "Thông báo",
        "Tên tài khoản chỉ gồm chữ và số và nhỏ hơn 50 kí tự",
        () => this.focusNameBank.focus()
      );
    } else if (
      address.trim() !== "" &&
      (!checkFullName(address) || address.length > 100)
    ) {
      AlertCommon(
        "Thông báo",
        "Địa chỉ gồm chữ và số và nhỏ hơn 100 kí tự",
        () => this.foucsAddress.focus()
      );
    } else if (
      passport.trim() !== "" &&
      (!checkAccountBank(passport) ||
        passport.length > 20 ||
        passport.length < 8)
    ) {
      AlertCommon(
        "Thông báo",
        "CMNN/CCCD chỉ gồm chữ và số lớn hơn 8 và nhỏ hơn 20 kí tự",
        () => this.focusCMNN.focus()
      );
    } else if (
      brankBank.trim() !== "" &&
      (!checkAgent(brankBank) || brankBank.length > 50)
    ) {
      AlertCommon(
        "Thông báo",
        "Chi nhánh ngân hàng chỉ gồm chữ và số và nhỏ hơn 50 kí tự",
        () => this.focusBrank.focus()
      );
    } else if (dayOfBirth == "") {
      AlertCommon("Thông báo", "Nhập ngày tháng năm sinh của bạn", () => null);
    } else if (
      nameBank.length === 0 &&
      (account.length !== 0 ||
        nameAccount.length !== 0 ||
        brankBank.length !== 0)
    ) {
      AlertCommon(
        "Thông báo",
        "Nhập thông tin tài khoản ngân hàng",
        () => null
      );
    } else if (
      account.length === 0 &&
      (nameBank.length !== 0 ||
        nameAccount.length !== 0 ||
        brankBank.length !== 0)
    ) {
      AlertCommon(
        "Thông báo",
        "Nhập thông tin tài khoản nhỏ hơn 20 chữ số",
        () => this.focusBankNum.focus()
      );
    } else if (
      nameAccount.length === 0 &&
      (account.length !== 0 || nameBank.length !== 0 || brankBank.length !== 0)
    ) {
      AlertCommon(
        "Thông báo",
        "Tên tài khoản chỉ gồm chữ và số và nhỏ hơn 50 kí tự",
        () => this.focusNameBank.focus()
      );
    } else if (
      brankBank.length === 0 &&
      (account.length !== 0 ||
        nameBank.length !== 0 ||
        nameAccount.length !== 0)
    ) {
      AlertCommon(
        "Thông báo",
        "Chi nhánh ngân hàng chỉ gồm chữ và số và nhỏ hơn 50 kí tự",
        () => this.focusBrank.focus()
      );
    } else {
      this.setState({
        loading: true,
      });
      UpdateInforAccount({
        USERNAME: authUser.USERNAME,
        USER_CTV: authUser.USERNAME,
        NAME: userName,
        DOB: dayOfBirth,
        GENDER: gender,
        EMAIL: email.trim(),
        CITY_NAME: city === "" ? "" : city.NAME,
        DISTRICT_NAME: district === "" ? "" : district.NAME,
        ADDRESS: address.trim(),
        STK: account.trim(),
        TENTK: nameAccount.trim(),
        TENNH: nameBank.vn_name.trim(),
        AVATAR: imageAvatar,
        IDSHOP: 'http://banbuonthuoc.moma.vn',
        CMT: passport.trim(),
        IMG1: CMT_1,
        IMG2: CMT_2,
        WARD_NAME: districChild === "" ? "" : districChild.NAME,
        OLD_PWD: "",
        NEW_PWD: "",
        MOBILE: phoneText.trim(),
        LEVEL_AGENCY: authUser.LEVEL_AGENCY,
      })
        .then((result) => {
          console.log("update", result);
          if (result.data.ERROR === "0000") {
            this.setState(
              {
                loading: false,
              },
              async () => {
                var password = '';
                await _retrieveData(PASSWORD).then((result) => {
                  if (result) {
                    password = result.substr(1).slice(0, -1)
                  }
                })
                this.props.LoginPhone({
                  IDSHOP: 'http://banbuonthuoc.moma.vn',
                  USERNAME: authUser.USERNAME,
                  PASSWORD: password,
                })
                  .then((result) => {
                    console.log(result, "login");
                  })
                  .catch((error) => {
                    console.log(error);
                  });
                this.message = setTimeout(
                  () =>
                    AlertCommon("Thông báo", result.data.RESULT, () => {
                      this.props.navigation.popToTop();
                      this.props.navigation.navigate("HomePay");
                    }),
                  10
                );
              }
            );
          } else {
            this.setState(
              {
                loading: false,
              },
              () => {
                this.message = setTimeout(
                  () =>
                    AlertCommon("Thông báo", result.data.RESULT, () => {
                      // this.props.navigation.popToTop();
                      // this.props.navigation.navigate("Home");
                    }),
                  10
                );
              }
            );
          }
        })
        .catch((error) => {
          this.setState({ loading: false });
          this.message = setTimeout(
            () => AlertCommon("Thông báo", "Có lỗi xảy ra", () => null),
            5
          );
          console.log(error);
        });
    }
  };
  changeCity = (text) => {
    if (text == "- tất cả -") {
      this.setState({ city: "", district: "", districChild: "" });
    } else {
      this.setState({ city: text, district: "", districChild: "" }, () => {
        console.log(this.state.district, "2020202020202020");
      });
    }
  };
  upload = (source, data, type) => {
    if (source != null) {
      var photo = { ...source, name: "image.jpg", type: "image/jpeg" };
      this.setState({
        loading: true,
      });
      //If file selected then create FormData
      const data = new FormData();
      data.append("name", "imagefile");
      data.append("image", photo);
      fetch("https://admin.babumart.vn/f/upload_image.jsp", {
        method: "post",
        body: data,
        headers: {
          "Content-Type": "multipart/form-data; ",
          "Content-Disposition": "form-data",
        },
      })
        .then(async (res) => {
          let responseJson = await res.json();
          console.log(responseJson);
          if (responseJson.ERROR == "0000") {
            console.log("Upload Successful", responseJson.URL);
            if (type === 1) {
              this.setState(
                {
                  imageAvatar: responseJson.URL,
                },
                () => this.setState({ loading: false })
              );
            } else if (type === 2) {
              this.setState(
                {
                  CMT_1: responseJson.URL,
                },
                () => this.setState({ loading: false })
              );
            } else if (type === 3) {
              this.setState(
                {
                  CMT_2: responseJson.URL,
                },
                () => this.setState({ loading: false })
              );
            }
            //this.props.onChange(responseJson.URL);
          } else {
            this.setState(
              {
                loading: false,
              },
              () => {
                this.message = setTimeout(
                  () =>
                    AlertCommon("Thông báo", responseJson.RESULT, () => null),
                  10
                );
              }
            );
          }
        })
        .catch((err) => {
          console.log("err", err);
          this.setState({ loading: false });
          this.message = setTimeout(
            () => AlertCommon("Thông báo", "Có lỗi xảy ra", () => null),
            5
          );
        });
    }
  };
  componentWillUnmount() {
    // this._unsubscribe();
    clearTimeout(this.message);
  }
  changeDistrict = (text) => {
    if (text == "- tất cả -") {
      this.setState({ district: "", districChild: "" });
    } else this.setState({ district: text, districChild: "" });
  };
  changeDistrictChild = (text) => {
    if (text == "- tất cả -") {
      this.setState({ districChild: "" });
    } else this.setState({ districChild: text });
  };
  handleImage = (type) => {
    ImagePicker.showImagePicker(options, async (response) => {
      console.log("Response = ", response);

      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.error) {
        console.log("ImagePicker Error: ", response.error);
      } else if (response.customButton) {
        console.log("User tapped custom button: ", response.customButton);
      } else {
        const source = { uri: response.uri };

        // You can also display the image using data:
        // const source = { uri: 'data:image/jpeg;base64,' + response.data };
        this.setState(
          {
            loading: true,
          },
          () => this.upload(source, response.data, type)
        );

        console.log("image", response);
      }
    });
  };
  changeStateAccount = (text) => {
    this.setState({
      account: text,
    });
  };
  changeStateName = (text) => {
    this.setState({
      nameAccount: text,
    });
  };
  changeStateBank = (text) => {
    this.setState({
      nameBank: text,
    });
  };
  deleteStateAccount = () => {
    this.setState({
      account: "",
    });
  };
  deleteStateName = () => {
    this.setState({
      nameAccount: "",
    });
  };
  deleteStateBank = () => {
    this.setState({
      nameBank: "",
    });
  };
  render() {
    const {
      phoneText,
      userName,
      idStore,
      levelStore,
      email,
      dayOfBirth,
      gender,
      city,
      district,
      districChild,
      address,
      passport,
      nameBank,
      nameAccount,
      account,
      showAlert,
      loading,
      imageAvatar,
      CMT_1,
      CMT_2,
      chinhanh,
      nameLogin,
      showCalendar,
      rose,
    } = this.state;
    console.log('nameee bank',nameBank.vn_name);
    return (
      <Provider>
        <ScrollView keyboardShouldPersistTaps="handled">
          <Spinner
            visible={loading}
            customIndicator={<ElementCustom />}
          //overlayColor="#ddd"
          />
          <View style={styles.viewAvatar}>
            {this.props.authUser.AVATAR == null ? (
              <IconComponets
                name="user-circle"
                size={sizeFont(20)}
                color={COLOR.MAIN}
              />
            ) : (
                <Avatar
                  size={"xlarge"}
                  containerStyle={{
                    borderWidth: 0.2,
                    borderColor: COLOR.MAIN,
                  }}
                  rounded
                  source={{
                    uri: imageAvatar,
                  }}
                />
              )}

            <TouchableOpacity
              style={styles.viewTouchCamera}
              onPress={() => this.handleImage(1)}
            >
              <IconComponets
                name="camera"
                size={sizeFont(6)}
                color={COLOR.MAIN}
              />
            </TouchableOpacity>
          </View>
          <View
            style={{ backgroundColor: "#F6F6F7", marginTop: sizeHeight(2) }}
          >
            <View style={styles.infor}>
              <Text style={styles.textInfor}>Thông tin Cộng tác viên</Text>
            </View>
            <View style={{ alignSelf: "center" }}>
              <FormTextInput
                props={{
                  placeholder: "Tên đăng nhập",
                  placeholderTextColor: "#Fafafa",
                  type: "name",
                  size: sizeFont(6),
                  name: "times-circle",
                  value: nameLogin,
                  primary: "#017DFF",
                  color: COLOR.COLOR_ICON,
                  onDelete: () => this.setState({ userName: "" }),
                  style: styles.styleWidth,
                }}
                editable={false}
                eye={false}
                onSetSee={this.onSetSee}
                styleTextInput={{
                  width: sizeWidth(78),
                }}
                styleChild={styles.styleChild}
              />

              <FormTextInput
                props={{
                  placeholder: "Họ và tên",
                  placeholderTextColor: "#Fafafa",
                  type: "name",
                  size: sizeFont(6),
                  name: "times-circle",
                  value: userName,
                  onChangeText: (text) => this.setState({ userName: text }),
                  primary: "#017DFF",
                  color: COLOR.COLOR_ICON,
                  onDelete: () => this.setState({ userName: "" }),
                  style: styles.styleWidth,
                }}
                eye={false}
                onSetSee={this.onSetSee}
                styleTextInput={{
                  width: sizeWidth(78),
                }}
                styleChild={styles.styleChild}
              />
              <FormTextInput
                props={{
                  placeholder: "Số điện thoại",
                  placeholderTextColor: "#999",
                  type: "phone",
                  size: sizeFont(6),
                  name: "times-circle",
                  value: phoneText,
                  onChangeText: (text) => this.setState({ phoneText: text }),
                  primary: "#017DFF",
                  color: COLOR.COLOR_ICON,
                  onDelete: () => this.setState({ phoneText: "" }),
                  style: styles.styleWidth,
                }}
                eye={false}
                onSetSee={this.onSetSee}
                styleTextInput={{
                  width: sizeWidth(78),
                }}
                styleChild={styles.styleChild}
              />
              <FormTextInput
                props={{
                  placeholder: "Hoa hồng ưu đãi theo CTV",
                  placeholderTextColor: "#999",
                  type: "name",
                  size: sizeFont(6),
                  name: "times-circle",
                  value: rose,
                  primary: "#017DFF",
                  color: COLOR.COLOR_ICON,
                  onDelete: () => this.setState({ email: "" }),
                  style: styles.styleWidth,
                }}
                eye={false}
                editable={false}
                onSetSee={this.onSetSee}
                styleTextInput={{
                  width: sizeWidth(78),
                }}
                styleChild={styles.styleChild}
              />
              <View style={{ height: sizeHeight(8), width: sizeWidth(91), marginTop: 10, marginBottom: 10, borderColor: COLOR.MAIN, borderWidth: 1, borderRadius: 5, padding: 10, backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between' }}>
                <View>
                  <Text style={{ color: 'gray', marginTop: -5 }}>Mã cộng tác viên</Text>
                  <Text style={{ lineHeight: 30 }}>{this.props.authUser.USER_CODE}</Text>
                </View>
                <TouchableOpacity onPress={() => Clipboard.setString(`${this.props.authUser.USER_CODE}`)}>
                  <Text>copy</Text>
                </TouchableOpacity>
              </View>
              <FormTextInput
                props={{
                  placeholder: "Email",
                  placeholderTextColor: "#999",
                  type: "name",
                  size: sizeFont(6),
                  name: "times-circle",
                  value: email,
                  onChangeText: (text) => this.setState({ email: text }),
                  primary: "#017DFF",
                  color: COLOR.COLOR_ICON,
                  onDelete: () => this.setState({ email: "" }),
                  style: styles.styleWidth,
                }}
                eye={false}
                onSetSee={this.onSetSee}
                styleTextInput={{
                  width: sizeWidth(78),
                }}
                styleChild={styles.styleChild}
              />
            </View>

            <View style={styles.viewGender}>
              <TouchableOpacity>
                <Text style={styles.textDayTitle}>Ngày sinh</Text>
                <Text
                  style={styles.textDayOfBirth}
                  onPress={() => this.setState({ showCalendar: true })}
                >
                  {dayOfBirth}{" "}
                </Text>
              </TouchableOpacity>
              <View>
                <Text style={[styles.textDayTitle, { textAlign: "right" }]}>
                  Giới tính
                </Text>
                <View style={styles.viewChildGender}>
                  <Text
                    onPress={() => {
                      this.setState({ gender: 1 });
                    }}
                    style={[
                      styles.textGender,
                      {
                        backgroundColor: gender == 1 ? "#fff" : "#ddd",
                      },
                    ]}
                  >
                    Nam
                  </Text>
                  <Text
                    onPress={() => {
                      this.setState({ gender: 0 });
                    }}
                    style={[
                      styles.textGender,
                      {
                        backgroundColor: gender == 0 ? "#fff" : "#ddd",
                      },
                    ]}
                  >
                    Nữ
                  </Text>
                </View>
              </View>
            </View>
            <View style={{ alignSelf: "center", marginTop: sizeHeight(1) }}>
              <FormTextInput
                props={{
                  placeholder: "Tỉnh/Thành phố",
                  placeholderTextColor: "#999",
                  type: "email",
                  size: sizeFont(8),
                  name: "chevron-down",
                  value: city.NAME == undefined ? "" : city.NAME,
                  onChangeText: (text) => null,
                  primary: "#017DFF",
                  color: COLOR.MAIN,
                  onDelete: () => null,
                  style: styles.styleWidth,
                }}
                eye={false}
                onSetSee={this.onSetSee}
                styleTextInput={{
                  width: sizeWidth(76),
                }}
                styleChild={styles.styleChild}
                pointerEvents="none"
                onPressCustom={() => {
                  this.props.navigation.navigate("ListCountries", {
                    onSetCity: this.changeCity,
                    NAME: "UpdateInformation",
                  });
                }}
                changeColor={COLOR.MAIN}
                light
              />
              <FormTextInput
                props={{
                  placeholder: "Quận/Huyện",
                  placeholderTextColor: "#999",
                  type: "email",
                  size: sizeFont(6),
                  name: "chevron-down",
                  value: district.NAME == undefined ? "" : district.NAME,
                  onChangeText: (text) => null,
                  primary: "#017DFF",
                  color: COLOR.MAIN,
                  onDelete: () => null,
                  style: styles.styleWidth,
                }}
                eye={false}
                onSetSee={this.onSetSee}
                styleTextInput={{
                  width: sizeWidth(76),
                }}
                styleChild={styles.styleChild}
                pointerEvents="none"
                onPressCustom={() => {
                  if (city == "") {
                    this.message = "Vui lòng chọn Tỉnh/Thành phố";
                    this.setState({ showAlert: true });
                  } else {
                    this.props.navigation.navigate("ListDistrict", {
                      onSetDistrict: this.changeDistrict,
                      GHN_TINHID: city.MATP,
                      NAME: "UpdateInformation",
                    });
                  }
                }}
                changeColor={COLOR.MAIN}
                light
              />
              <FormTextInput
                props={{
                  placeholder: "Phường/Xã",
                  placeholderTextColor: "#999",
                  type: "email",
                  size: sizeFont(6),
                  name: "chevron-down",
                  value:
                    districChild.NAME == undefined ? "" : districChild.NAME,
                  onChangeText: (text) => null,
                  primary: "#017DFF",
                  color: COLOR.MAIN,
                  onDelete: () => null,
                  style: styles.styleWidth,
                }}
                eye={false}
                onSetSee={this.onSetSee}
                styleTextInput={{
                  width: sizeWidth(76),
                }}
                styleChild={styles.styleChild}
                pointerEvents="none"
                onPressCustom={() => {
                  if (city == "") {
                    this.setState({ showAlert: true });
                  } else if (district == "") {
                    this.message = "Vui lòng chọn Quận/Huyện";
                    this.setState({ showAlert: true });
                  } else {
                    this.props.navigation.navigate("ListDistrictChild", {
                      onSetDistrictChild: this.changeDistrictChild,
                      GHN_TINHID: district.MAQH,
                      NAME: "UpdateInformation",
                    });
                  }
                }}
                changeColor={COLOR.MAIN}
                light
              />
              <FormTextInput
                props={{
                  placeholder: "Địa chỉ",
                  placeholderTextColor: "#999",
                  type: "email",
                  size: sizeFont(6),
                  name: "times-circle",
                  value: address,
                  onChangeText: (text) => this.setState({ address: text }),
                  primary: "#017DFF",
                  color: COLOR.MAIN,
                  onDelete: () => {
                    this.setState({ address: "" });
                  },
                  style: styles.styleWidth,
                }}
                eye={false}
                onSetSee={this.onSetSee}
                styleTextInput={{
                  width: sizeWidth(78),
                }}
                styleChild={styles.styleChild}
              />

              <FormTextInput
                props={{
                  placeholder: "Số CMND",
                  placeholderTextColor: "#999",
                  type: "phone",
                  size: sizeFont(6),
                  name: "times-circle",
                  value: passport,
                  onChangeText: (text) => this.setState({ passport: text }),
                  primary: "#017DFF",
                  color: COLOR.MAIN,
                  onDelete: () => this.setState({ passport: "" }),
                  style: styles.styleWidth,
                }}
                eye={false}
                onSetSee={this.onSetSee}
                styleTextInput={{
                  width: sizeWidth(78),
                }}
                styleChild={styles.styleChild}
              />
            </View>
            <View style={styles.viewImage}>
              <View style={styles.viewImageChild}>
                <Text>Ảnh CMND mặt trước</Text>
                <View style={styles.viewCMT}>
                  <TouchableOpacity
                    style={styles.touchCMT}
                    onPress={() => this.handleImage(2)}
                  >
                    {CMT_1 == "" ? (
                      <IconComponets
                        name="camera"
                        size={sizeFont(20)}
                        color={COLOR.MAIN}
                      />
                    ) : (
                        <Image
                          resizeMode="cover"
                          style={styles.imageCMT}
                          source={{
                            uri: CMT_1,
                          }}
                        />
                      )}
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.viewImageChild}>
                <Text>Ảnh CMND mặt sau</Text>
                <View style={styles.viewCMT}>
                  <TouchableOpacity
                    style={styles.touchCMT}
                    onPress={() => this.handleImage(3)}
                  >
                    {CMT_2 == "" ? (
                      <IconComponets
                        name="camera"
                        size={sizeFont(20)}
                        color={COLOR.MAIN}
                      />
                    ) : (
                        <Image
                          resizeMode="cover"
                          style={styles.imageCMT}
                          source={{
                            uri: CMT_2,
                          }}
                        />
                      )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <ListBank
              account={account}
              nameAccount={nameAccount}
              chinhanh={chinhanh}
              nameBank={nameBank}
              navigation={this.props.navigation}
              changeStateAccount={this.changeStateAccount}
              changeStateName={this.changeStateName}
              changeStateBank={this.changeStateBank}
              deleteStateAccount={this.deleteStateAccount}
              deleteStateBank={this.deleteStateBank}
              deleteStateName={this.deleteStateName}
              updateAccount={() => {
                this.setState({ loading: true }, () => this.updateAccount());
              }}
              title="CẬP NHẬT"
            />
          </View>

          <AlertDesignNotification
            showAlert={showAlert}
            message={this.message}
            title="Thông báo"
            onClose={() => this.setState({ showAlert: false })}
          />
          <DateTimePickerModal
            isVisible={showCalendar}
            mode="date"
            date={new Date(moment("01/01/1990").format("DD/MM/YYYY"))}
            maximumDate={new Date()}
            onConfirm={(day) => {
              this.handleDate(day);
            }}
            onCancel={() => this.setState({ showCalendar: false })}
          />
          <View
            style={{
              paddingBottom: sizeHeight(30),
              backgroundColor: "#F6F6F7",
            }}
          />
        </ScrollView>
      </Provider>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    status: state.authUser.status,
    authUser: state.authUser.authUser,
    username: state.authUser.username,
    idshop: state.product.database,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    GetProfile: (text) => dispatch(GetProfile(text)),
    LoginPhone: (data) => dispatch(LoginPhone(data)),
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UpdateInformation);
