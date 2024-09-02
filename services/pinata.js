require('dotenv').config();
const lighthouse = require('@lighthouse-web3/sdk');

const axios = require('axios')
const FormData = require('form-data');
const fs = require('fs');
const pinataSDK = require('@pinata/sdk');


const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET_KEY);

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


const createMetaData = async (id, title, description, propertyCategory, estimatedAppreciation, propertyLocation, fractionPrice, image, featuredImage, amount) => {

  let uris = [];

  try {
    for (let i = 0; i < amount; i++) {
      const options = {
        pinataMetadata: {
          name: 'IRA Metadata',
        },
        pinataOptions: {
          cidVersion: 0
        }
      };

      const metaData = {
        "description": description,
        "image": featuredImage,
        "name": title,
        "propertyImages": image,
        "index": i + 1,
        "propertyId": id,
        "attributes": [
          {
            "trait_type": "Property Category",
            "value": propertyCategory
          },
          {
            "trait_type": "Estimated Appreciation",
            "value": estimatedAppreciation
          },
          {
            "trait_type": "Property Location",
            "value": propertyLocation
          },
          {
            "trait_type": "Fraction Price",
            "value": fractionPrice
          }
        ]
      }

      const ipfsURI = await pinata.pinJSONToIPFS(metaData, options).catch((err) => { return err });

      if (ipfsURI instanceof Error) {
        return ipfsURI;
      } else {
        const uri = `https://ipfs.io/ipfs/${ipfsURI.IpfsHash}`;
        uris.push(uri);
      }
    }
    return uris;
  }
  catch (err) {
    throw err;
  }


}

const uploadPinata = async (data, amount) => {
  const splitedPropertyImages = data.property_images.split(',');

  const images = [data.featured_image, ...splitedPropertyImages];

  const options = {
    pinataMetadata: {
      name: 'IRA',
    },
    pinataOptions: {
      cidVersion: 0
    }
  };

  const image = [];

  for (let i = 0; i < images.length; i++) {
    await pinata.pinFileToIPFS(fs.createReadStream(`${ROOT_DIR}/uploads/property_image/${images[i]}`), options).then((result) => {
      image.push(`https://ipfs.io/ipfs/${result.IpfsHash}`);
    }).catch((err) => { throw err })
  }

  let featuredImage = image.shift();

  const response = await createMetaData(data.property_id, data.title, data.property_description, data.property_category, data.estimated_appreciation, data.property_location, data.fraction_price, image, featuredImage, amount)

  return response;

}

const uploadMetadata = async (id, title, description, propertyCategory, estimatedAppreciation, propertyLocation, fractionPrice, image, featuredImage, amount) => {

  let uris = [];

  const apiKey = process.env.LIGHTHOUSE_API_KEY;

  try {
    for (let i = 0; i < amount; i++) {

      const metaData = {
        "description": description,
        "image": featuredImage,
        "name": title,
        "propertyImages": image,
        "index": i + 1,
        "propertyId": id,
        "attributes": [
          {
            "trait_type": "Property Category",
            "value": propertyCategory
          },
          {
            "trait_type": "Estimated Appreciation",
            "value": estimatedAppreciation
          },
          {
            "trait_type": "Property Location",
            "value": propertyLocation
          },
          {
            "trait_type": "Fraction Price",
            "value": fractionPrice
          }
        ]
      }
      const stringifyMetaData = JSON.stringify(metaData);
      const response = await lighthouse.uploadText(stringifyMetaData, apiKey).catch((err) => { return err });

      if (response instanceof Error) {
        return response;
      }
      else {
        const uri = `https://gateway.lighthouse.storage/ipfs/${response.data.Hash}`;
        uris.push(uri);
      }
    }
    return uris;
  } catch (error) {
    return error;
  }
}

const uploadOnLighthouse = async (data, amount) => {


  const splitedPropertyImages = data.property_images.split(',');

  const images = [data.featured_image, ...splitedPropertyImages];

  const image = [];
  const apiKey = process.env.LIGHTHOUSE_API_KEY;

  for (let i = 0; i < images.length; i++) {
    let path = `${ROOT_DIR}/uploads/property_image/${images[i]}`;
    const response = await lighthouse.upload(path, apiKey);
    image.push(`https://gateway.lighthouse.storage/ipfs/${response.data.Hash}`);
  }

  let featuredImage = image.shift();

  const response = await uploadMetadata(data.property_id, data.title, data.property_description, data.property_category, data.estimated_appreciation, data.property_location, data.fraction_price, image, featuredImage, amount)

  return response;

}


module.exports = { uploadPinata, uploadOnLighthouse, sleep }