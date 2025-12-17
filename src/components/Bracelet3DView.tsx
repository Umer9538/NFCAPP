/**
 * 3D Bracelet Viewer
 * Interactive 3D visualization of NFC bracelet using Three.js
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Text,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from 'expo-gl';
import * as THREE from 'three';
import { PRIMARY, GRAY } from '@/constants/colors';

interface Bracelet3DViewProps {
  nfcId?: string;
  status?: 'active' | 'inactive' | 'lost';
  autoRotate?: boolean;
}

const { width } = Dimensions.get('window');

export const Bracelet3DView: React.FC<Bracelet3DViewProps> = ({
  nfcId,
  status = 'active',
  autoRotate = true,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const rotationRef = useRef({ x: Math.PI / 3, y: -Math.PI / 8 });
  const lastPanRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const rendererRef = useRef<Renderer | null>(null);
  const braceletRef = useRef<THREE.Group | null>(null);

  // Pan responder for touch controls
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        isDraggingRef.current = true;
        lastPanRef.current = { x: rotationRef.current.x, y: rotationRef.current.y };
      },
      onPanResponderMove: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        const sensitivity = 0.01;
        rotationRef.current.y = lastPanRef.current.y + gestureState.dx * sensitivity;
        rotationRef.current.x = lastPanRef.current.x - gestureState.dy * sensitivity;

        // Clamp x rotation to prevent flipping
        rotationRef.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationRef.current.x));
      },
      onPanResponderRelease: () => {
        isDraggingRef.current = false;
      },
    })
  ).current;

  const onContextCreate = async (gl: ExpoWebGLRenderingContext) => {
    try {
      // Setup renderer using Three.js WebGLRenderer directly
      const renderer = new THREE.WebGLRenderer({
        canvas: {
          width: gl.drawingBufferWidth,
          height: gl.drawingBufferHeight,
          style: {},
          addEventListener: () => {},
          removeEventListener: () => {},
          clientHeight: gl.drawingBufferHeight,
          clientWidth: gl.drawingBufferWidth,
          getContext: () => gl,
          toDataURL: () => '',
        } as any,
        context: gl,
      });
      renderer.setSize(width, 400);
      renderer.setClearColor(0xf5f5f5, 1);
      rendererRef.current = renderer as any;

      // Setup scene
      const scene = new THREE.Scene();

      // Setup camera
      const camera = new THREE.PerspectiveCamera(
        45,
        width / 400,
        0.1,
        1000
      );
      camera.position.set(0.5, 0.8, 5);
      camera.lookAt(0, 0, 0);

      // Add lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);

      const backLight = new THREE.DirectionalLight(0xffffff, 0.4);
      backLight.position.set(-5, -5, -5);
      scene.add(backLight);

      // Create bracelet
      const bracelet = createBracelet(status);
      scene.add(bracelet);
      braceletRef.current = bracelet;

      setIsLoading(false);

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);

        if (autoRotate && !isDraggingRef.current) {
          rotationRef.current.y += 0.01;
        }

        // Apply rotation
        if (braceletRef.current) {
          braceletRef.current.rotation.x = rotationRef.current.x;
          braceletRef.current.rotation.y = rotationRef.current.y;
        }

        renderer.render(scene, camera);
        gl.endFrameEXP?.();
      };

      animate();
    } catch (error) {
      console.error('[3D Bracelet] Error creating 3D view:', error);
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY[500]} />
          <Text style={styles.loadingText}>Loading 3D Model...</Text>
        </View>
      )}
      <GLView
        style={styles.glView}
        onContextCreate={onContextCreate}
      />
      {!isLoading && (
        <View style={styles.helpText}>
          <Text style={styles.helpTextContent}>
            👆 Drag to rotate • Auto-rotates when idle
          </Text>
        </View>
      )}
    </View>
  );
};

/**
 * Create 3D bracelet geometry
 */
function createBracelet(status: string): THREE.Group {
  const braceletGroup = new THREE.Group();

  // Determine color based on status
  const color = status === 'active'
    ? 0x10b981 // green
    : status === 'lost'
    ? 0xef4444 // red
    : 0x6b7280; // gray

  // Create main band (torus for circular bracelet) - INCREASED SIZE
  const bandGeometry = new THREE.TorusGeometry(1.6, 0.2, 16, 100);
  const bandMaterial = new THREE.MeshStandardMaterial({
    color: color,
    metalness: 0.7,
    roughness: 0.3,
  });
  const band = new THREE.Mesh(bandGeometry, bandMaterial);
  braceletGroup.add(band);

  // Create NFC chip housing (small box on the band) - SCALED UP
  const chipGeometry = new THREE.BoxGeometry(0.5, 0.33, 0.13);
  const chipMaterial = new THREE.MeshStandardMaterial({
    color: 0x1f2937, // dark gray
    metalness: 0.9,
    roughness: 0.2,
  });
  const chip = new THREE.Mesh(chipGeometry, chipMaterial);
  chip.position.set(1.6, 0, 0);
  braceletGroup.add(chip);

  // Add metallic accent line - SCALED UP
  const accentGeometry = new THREE.TorusGeometry(1.67, 0.025, 8, 100);
  const accentMaterial = new THREE.MeshStandardMaterial({
    color: 0xd1d5db,
    metalness: 1.0,
    roughness: 0.1,
  });
  const accent = new THREE.Mesh(accentGeometry, accentMaterial);
  braceletGroup.add(accent);

  // Add inner detail ring - SCALED UP
  const innerGeometry = new THREE.TorusGeometry(1.4, 0.04, 8, 100);
  const innerMaterial = new THREE.MeshStandardMaterial({
    color: 0x374151,
    metalness: 0.8,
    roughness: 0.4,
  });
  const inner = new THREE.Mesh(innerGeometry, innerMaterial);
  braceletGroup.add(inner);

  // Add NFC icon indicator (small cylinders)
  const indicatorGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.15, 16);
  const indicatorMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: status === 'active' ? 0x10b981 : 0x000000,
    emissiveIntensity: 0.5,
  });

  // Create NFC wave pattern
  for (let i = 0; i < 3; i++) {
    const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
    indicator.position.set(1.15 + (i * 0.08), 0, 0.06);
    indicator.rotation.z = Math.PI / 2;
    indicator.scale.set(1, 0.5 + (i * 0.3), 1);
    braceletGroup.add(indicator);
  }

  // Add status light
  if (status === 'active') {
    const lightGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    const lightMaterial = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 1.0,
    });
    const light = new THREE.Mesh(lightGeometry, lightMaterial);
    light.position.set(1.3, 0.15, 0);
    braceletGroup.add(light);

    // Add point light for glow effect
    const pointLight = new THREE.PointLight(0x10b981, 1, 2);
    pointLight.position.set(1.3, 0.15, 0);
    braceletGroup.add(pointLight);
  }

  // Initial rotation will be handled by rotationRef
  return braceletGroup;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 400,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  glView: {
    width: '100%',
    height: 400,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: GRAY[600],
    fontWeight: '500',
  },
  helpText: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  helpTextContent: {
    fontSize: 12,
    color: GRAY[600],
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
});
