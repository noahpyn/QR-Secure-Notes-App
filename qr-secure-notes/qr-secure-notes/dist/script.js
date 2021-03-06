new Vue({
  el: '#app',
  data() {
    return {
      title: 'A secure QR note',
      text: 'codepen',
      key: 'rocks',
      showPw: false,
      decoder: QCodeDecoder(),
      qrData: null,
      requirePassword: false,
      password: null,
      wrongPassword: false,
      decData: null };

  },
  computed: {
    encrypted() {
      return this.encrypt(this.text, this.key);
    },
    qrCodeImg() {
      const qr = new QRious({
        value: this.encrypted,
        size: 1000,
        foreground: '#414141' });

      return qr.toDataURL('image/png');
    },
    btnDisabled() {
      return !this.text.length || !this.key.length;
    } },

  methods: {
    encrypt(text, key) {
      const cipherText = CryptoJS.AES.encrypt(text, key);
      return cipherText.toString();
    },
    decrypt(text, key) {
      const bytes = CryptoJS.AES.decrypt(text, key);
      return bytes.toString(CryptoJS.enc.Utf8);
    },
    print() {
      window.print();
    },
    tgPw() {
      this.showPw = !this.showPw;
    },
    resetAll() {
      this.decData = null;
      this.requirePassword = false;
      this.password = null;
      this.qrData = null;
    },
    toggleCamera() {
      const { decoder } = this;

      if (decoder.stream) {
        const tracks = decoder.stream.getTracks();
        tracks[0].stop();
        decoder.stream = null;
        this.resetAll();
      } else {
        const el = document.querySelector('video');
        decoder.decodeFromCamera(el, (err, data) => {
          if (err) return console.log(err);
          if (!this.requirePassword) {
            this.password = null;
            this.qrData = data;
          }
          this.requirePassword = true;
        });
      }
    },
    showDecrypted() {
      try {
        const dec = this.decrypt(this.qrData, this.password);
        if (!dec) throw Error('Empty note or wrong password.');

        this.requirePassword = false;
        this.password = null;
        this.decData = dec;
      } catch (e) {
        this.wrongPassword = true;
        console.log(e);
      }
    } } });