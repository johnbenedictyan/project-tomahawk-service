function SVY21(){
  a = 6378137
  f = 1 / 298.257223563
  oLat = 1.366666     // origin's lat in degrees
  oLon = 103.833333   // origin's lon in degrees
  oN = 38744.572      // false Northing
  oE = 28001.642      // false Easting
  k = 1               // scale factor

  this.b = this.a * (1 - this.f);
  this.e2 = (2 * this.f) - (this.f * this.f);
  this.e4 = this.e2 * this.e2;
  this.e6 = this.e4 * this.e2l
  this.A0 = 1 - (this.e2 / 4) - (3 * this.e4 / 64) - (5 * this.e6 / 256);
  this.A2 = (3. / 8.) * (this.e2 + (this.e4 / 4) + (15 * this.e6 / 128));
  this.A4 = (15. / 256.) * (this.e4 + (3 * this.e6 / 4));
  this.A6 = 35 * this.e6 / 3072;

  this.computeSVY21 = function(lat, lon){
    latR = lat * Math.pi / 180;
    sinLat = Math.sin(latR);
    sin2Lat = sinLat * sinLat;
    cosLat = Math.cos(latR);
    cos2Lat = cosLat * cosLat;
    cos3Lat = cos2Lat * cosLat;
    cos4Lat = cos3Lat * cosLat;
    cos5Lat = cos4Lat * cosLat;
    cos6Lat = cos5Lat * cosLat;
    cos7Lat = cos6Lat * cosLat;

    rho = this.calcRho(sin2Lat);
    v = this.calcV(sin2Lat);
    psi = v / rho;
    t = Math.tan(latR);
    w = (lon - this.oLon) * Math.pi / 180;

    M = this.calcM(lat);
    Mo = this.calcM(this.oLat);

    w2 = w * w;
    w4 = w2 * w2;
    w6 = w4 * w2;
    w8 = w6 * w2;

    psi2 = psi * psi;
    psi3 = psi2 * psi;
    psi4 = psi3 * psi;

    t2 = t * t;
    t4 = t2 * t2;
    t6 = t4 * t2;

    // Compute Northing
    nTerm1 = w2 / 2 * v * sinLat * cosLat;
    nTerm2 = w4 / 24 * v * sinLat * cos3Lat * (4 * psi2 + psi - t2);
    nTerm3 = w6 / 720 * v * sinLat * cos5Lat * ((8 * psi4) * (11 - 24 * t2) - (28 * psi3) * (1 - 6 * t2) + psi2 * (1 - 32 * t2) - psi * 2 * t2 + t4);
    nTerm4 = w8 / 40320 * v * sinLat * cos7Lat * (1385 - 3111 * t2 + 543 * t4 - t6);
    N = this.oN + this.k * (M - Mo + nTerm1 + nTerm2 + nTerm3 + nTerm4);

    // Compute Easting
    eTerm1 = w2 / 6 * cos2Lat * (psi - t2);
    eTerm2 = w4 / 120 * cos4Lat * ((4 * psi3) * (1 - 6 * t2) + psi2 * (1 + 8 * t2) - psi * 2 * t2 + t4);
    eTerm3 = w6 / 5040 * cos6Lat * (61 - 479 * t2 + 179 * t4 - t6);
    E = this.oE + this.k * v * w * cosLat * (1 + eTerm1 + eTerm2 + eTerm3);

    return (N, E);

  }

  this.calcM(lat){
    latR = lat * Math.pi / 180
    return this.a * ((this.A0 * latR) - (this.A2 * Math.sin(2 * latR)) + (this.A4 * Math.sin(4 * latR)) - (this.A6 * Math.sin(6 * latR)));
  }

  this.calcRho(sin2Lat){
      num = this.a * (1 - this.e2)
      denom = Math.pow(1 - this.e2 * sin2Lat, 3. / 2.)
      return num / denom
    }

  this.calcV(sin2Lat){
      poly = 1 - this.e2 * sin2Lat
      return this.a / Math.sqrt(poly)
    }

  this.computeLatLon(N, E){
      Nprime = N - this.oN;
      Mo = this.calcM(this.oLat);
      Mprime = Mo + (Nprime / this.k);
      n = (this.a - this.b) / (this.a + this.b);
      n2 = n * n;
      n3 = n2 * n;
      n4 = n2 * n2;
      G = this.a * (1 - n) * (1 - n2) * (1 + (9 * n2 / 4) + (225 * n4 / 64)) * (Math.pi / 180);
      sigma = (Mprime * Math.pi) / (180. * G);

      latPrimeT1 = ((3 * n / 2) - (27 * n3 / 32)) * Math.sin(2 * sigma);
      latPrimeT2 = ((21 * n2 / 16) - (55 * n4 / 32)) * Math.sin(4 * sigma);
      latPrimeT3 = (151 * n3 / 96) * Math.sin(6 * sigma);
      latPrimeT4 = (1097 * n4 / 512) * Math.sin(8 * sigma);
      latPrime = sigma + latPrimeT1 + latPrimeT2 + latPrimeT3 + latPrimeT4;

      sinLatPrime = Math.sin(latPrime);
      sin2LatPrime = sinLatPrime * sinLatPrime;

      rhoPrime = this.calcRho(sin2LatPrime);
      vPrime = this.calcV(sin2LatPrime);
      psiPrime = vPrime / rhoPrime;
      psiPrime2 = psiPrime * psiPrime;
      psiPrime3 = psiPrime2 * psiPrime;
      psiPrime4 = psiPrime3 * psiPrime;
      tPrime = Math.tan(latPrime);
      tPrime2 = tPrime * tPrime;
      tPrime4 = tPrime2 * tPrime2;
      tPrime6 = tPrime4 * tPrime2;
      Eprime = E - this.oE;
      x = Eprime / (this.k * vPrime);
      x2 = x * x;
      x3 = x2 * x;
      x5 = x3 * x2;
      x7 = x5 * x2;

      // Compute Latitude
      latFactor = tPrime / (this.k * rhoPrime);
      latTerm1 = latFactor * ((Eprime * x) / 2);
      latTerm2 = latFactor * ((Eprime * x3) / 24) * ((-4 * psiPrime2) + (9 * psiPrime) * (1 - tPrime2) + (12 * tPrime2));
      latTerm3 = latFactor * ((Eprime * x5) / 720) * ((8 * psiPrime4) * (11 - 24 * tPrime2) - (12 * psiPrime3) * (21 - 71 * tPrime2) + (15 * psiPrime2) * (15 - 98 * tPrime2 + 15 * tPrime4) + (180 * psiPrime) * (5 * tPrime2 - 3 * tPrime4) + 360 * tPrime4);
      latTerm4 = latFactor * ((Eprime * x7) / 40320) * (1385 - 3633 * tPrime2 + 4095 * tPrime4 + 1575 * tPrime6);
      lat = latPrime - latTerm1 + latTerm2 - latTerm3 + latTerm4;

      // Compute Longitude
      secLatPrime = 1. / Math.cos(lat);
      lonTerm1 = x * secLatPrime;
      lonTerm2 = ((x3 * secLatPrime) / 6) * (psiPrime + 2 * tPrime2);
      lonTerm3 = ((x5 * secLatPrime) / 120) * ((-4 * psiPrime3) * (1 - 6 * tPrime2) + psiPrime2 * (9 - 68 * tPrime2) + 72 * psiPrime * tPrime2 + 24 * tPrime4);
      lonTerm4 = ((x7 * secLatPrime) / 5040) * (61 + 662 * tPrime2 + 1320 * tPrime4 + 720 * tPrime6);
      lon = (this.oLon * Math.pi / 180) + lonTerm1 - lonTerm2 + lonTerm3 - lonTerm4;

      return (lat / (Math.pi / 180), lon / (Math.pi / 180));
    }
}
