export function getStatus(status_id) {
  switch (status_id) {
    case 'bf9cc968-367d-4391-93fa-f77eda2a7a99':
      return 'preorder'; //yellow
    case 'b5d1aa93-bccd-40bb-ae29-ea5a85a2b1d1':
    case 'c4227d1b-c317-46f8-b1e3-a48c2496206f':
    case '6ba783a3-1c2e-479c-9626-25526b3d9d36':
    case 'd39cb255-6cf5-4602-896d-9c559d40cbbe':
      return 'cancelled'; //red
    case '986a0d09-7b4d-4ca9-8567-aa1c6d770505':
    case 'ccb62ffb-f0e1-472e-bf32-d130bea90617':
    case '1b6dc9a3-64aa-4f68-b54f-71ffe8164cd3':
    case 'b0cb7c69-5e3d-47c7-9813-b0a7cc3d81fd':
    case '8781af8e-f74d-4fb6-ae23-fd997f4a2ee0':
    case '84be5a2f-3a92-4469-8283-220ca34a0de4':
      return 'active'; //blue
    case '79413606-a56f-45ed-97c3-f3f18e645972':
    case 'e665273d-5415-4243-a329-aee410e39465':
      return 'finished'; //green
  }
}

export function getStatusName(status_id) {
  switch (status_id) {
    case '986a0d09-7b4d-4ca9-8567-aa1c6d770505':
      return 'new';
    case 'bf9cc968-367d-4391-93fa-f77eda2a7a99':
      return 'future';
    case 'ccb62ffb-f0e1-472e-bf32-d130bea90617':
      return 'new'; // operator-accepted
    case 'b5d1aa93-bccd-40bb-ae29-ea5a85a2b1d1':
      return 'operator-cancelled';
    case '1b6dc9a3-64aa-4f68-b54f-71ffe8164cd3':
      return 'vendor-accepted';
    case 'c4227d1b-c317-46f8-b1e3-a48c2496206f':
      return 'vendor-cancelled';
    case 'b0cb7c69-5e3d-47c7-9813-b0a7cc3d81fd':
      return 'vendor-ready';
    case '6ba783a3-1c2e-479c-9626-25526b3d9d36':
      return 'courier-cancelled';
    case '8781af8e-f74d-4fb6-ae23-fd997f4a2ee0':
      return 'courier-accepted';
    case '84be5a2f-3a92-4469-8283-220ca34a0de4':
      return 'courier-picked';
    case '79413606-a56f-45ed-97c3-f3f18e645972':
      return 'delivered';
    case 'e665273d-5415-4243-a329-aee410e39465':
      return 'finished';
    case 'd39cb255-6cf5-4602-896d-9c559d40cbbe':
      return 'server-cancelled';
  }
}

export function getStatusDescr(status_id) {
  switch (status_id) {
    case '986a0d09-7b4d-4ca9-8567-aa1c6d770505':
      return 'new';
    case 'bf9cc968-367d-4391-93fa-f77eda2a7a99':
      return 'future';
    case 'ccb62ffb-f0e1-472e-bf32-d130bea90617':
      return 'operator-accepted';
    case 'b5d1aa93-bccd-40bb-ae29-ea5a85a2b1d1':
      return 'operator-cancelled';
    case '1b6dc9a3-64aa-4f68-b54f-71ffe8164cd3':
      return 'vendor-accepted';
    case 'c4227d1b-c317-46f8-b1e3-a48c2496206f':
      return 'vendor-cancelled';
    case 'b0cb7c69-5e3d-47c7-9813-b0a7cc3d81fd':
      return 'vendor-ready';
    case '6ba783a3-1c2e-479c-9626-25526b3d9d36':
      return 'courier-cancelled';
    case '8781af8e-f74d-4fb6-ae23-fd997f4a2ee0':
      return 'courier-accepted';
    case '84be5a2f-3a92-4469-8283-220ca34a0de4':
      return 'courier-picked';
    case '79413606-a56f-45ed-97c3-f3f18e645972':
      return 'delivered';
    case 'e665273d-5415-4243-a329-aee410e39465':
      return 'finished';
    case 'd39cb255-6cf5-4602-896d-9c559d40cbbe':
      return 'server-cancelled';
  }
}

export function getTrackingStatus(status_id) {
  switch (status_id) {
    case '986a0d09-7b4d-4ca9-8567-aa1c6d770505':
      return 'new';
    case 'bf9cc968-367d-4391-93fa-f77eda2a7a99':
      return 'future';
    case 'ccb62ffb-f0e1-472e-bf32-d130bea90617':
      return 'accepted';
    case '1b6dc9a3-64aa-4f68-b54f-71ffe8164cd3':
    case '8781af8e-f74d-4fb6-ae23-fd997f4a2ee0':
      return 'getting_ready';
    case 'b0cb7c69-5e3d-47c7-9813-b0a7cc3d81fd':
      return 'ready';
    case '84be5a2f-3a92-4469-8283-220ca34a0de4':
      return 'courier-picked';
    case '79413606-a56f-45ed-97c3-f3f18e645972':
    case 'e665273d-5415-4243-a329-aee410e39465':
      return 'delivered';
    case 'b5d1aa93-bccd-40bb-ae29-ea5a85a2b1d1':
    case 'c4227d1b-c317-46f8-b1e3-a48c2496206f':
    case '6ba783a3-1c2e-479c-9626-25526b3d9d36':
    case 'd39cb255-6cf5-4602-896d-9c559d40cbbe':
      return 'cancelled';
  }
}
